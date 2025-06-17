import { CreateBoardDialog } from "@/components/create-board-dialog";
import { BoardGrid } from "@/components/board-grid";
import { ThemeToggle } from "@/components/theme-toggle";
import { prisma } from "@/lib/prisma";
import { Scroll, Users, Star } from "lucide-react";

async function getBoards() {
	try {
		return await prisma.board.findMany({
			orderBy: { position: 'asc' },
			include: {
				columns: {
					include: {
						tasks: true
					}
				}
			}
		});
	} catch (error) {
		console.error('ボード取得エラー:', error);
		return [];
	}
}

export default async function Home() {
	const boards = await getBoards();
	const totalTasks = boards.reduce((total, board) => 
		total + board.columns.reduce((colTotal, column) => colTotal + column.tasks.length, 0), 0
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-red-100 dark:from-slate-900 dark:via-slate-800 dark:to-amber-900/20">
			{/* ヘッダー - レスポンシブな看板風デザイン */}
			<div className="retro-sign text-white shadow-2xl relative overflow-hidden">
				{/* 装飾的な境界線 */}
				<div className="absolute inset-0 border-2 sm:border-4 border-amber-600 rounded-lg m-1 sm:m-2"></div>
				<div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8 relative z-10">
					<div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-0">
						<div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6 fade-in-left">
							<div className="bg-amber-700 p-2 sm:p-3 lg:p-4 rounded-full border-2 sm:border-3 border-amber-500 shadow-lg bounce-in">
								<Scroll className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-amber-100" />
							</div>
							<div className="text-center sm:text-left">
								<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wider text-amber-100 drop-shadow-lg fade-in-up">
									🏛️ ギルド掲示板
								</h1>
								<p className="text-amber-200 text-sm sm:text-base lg:text-lg font-medium tracking-wide fade-in-up" style={{animationDelay: '0.2s'}}>
									<span className="hidden sm:inline">～ </span>冒険者たちのクエスト管理システム<span className="hidden sm:inline"> ～</span>
								</p>
							</div>
						</div>
						<div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 lg:gap-8 fade-in-right w-full lg:w-auto">
							<div className="flex items-center gap-3 sm:gap-4">
								<div className="text-center bg-amber-600/20 px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-lg border border-amber-500 pulse-glow stagger-item">
									<div className="text-xl sm:text-2xl lg:text-3xl font-bold text-amber-100 drop-shadow">{boards.length}</div>
									<div className="text-xs sm:text-sm text-amber-200 font-medium">ボード</div>
								</div>
								<div className="text-center bg-amber-600/20 px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-lg border border-amber-500 pulse-glow stagger-item">
									<div className="text-xl sm:text-2xl lg:text-3xl font-bold text-amber-100 drop-shadow">{totalTasks}</div>
									<div className="text-xs sm:text-sm text-amber-200 font-medium">クエスト</div>
								</div>
							</div>
							<div className="flex items-center gap-2 sm:gap-3">
								<div className="stagger-item">
									<CreateBoardDialog />
								</div>
								<div className="stagger-item">
									<ThemeToggle />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* メインコンテンツ */}
			<div className="container mx-auto px-3 sm:px-6 py-6 sm:py-10">
				{/* サブヘッダー */}
				<div className="mb-6 sm:mb-10">
					<div className="retro-card rounded-lg sm:rounded-xl shadow-lg border-2 border-amber-300 p-4 sm:p-6 lg:p-8">
						<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
							<div className="flex items-center space-x-3 sm:space-x-4">
								<Star className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-amber-600 flex-shrink-0" />
								<div>
									<h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-900 dark:text-amber-100 tracking-wide">
										📋 アクティブなクエストボード
									</h2>
									<p className="text-amber-700 dark:text-amber-200 text-sm sm:text-base font-medium">
										<span className="hidden sm:inline">ドラッグ&ドロップでボードの順序を変更できます</span>
										<span className="sm:hidden">タップしてボードを開く</span>
									</p>
								</div>
							</div>
							<div className="flex items-center space-x-2 sm:space-x-3 text-sm sm:text-base text-amber-700 dark:text-amber-200 bg-amber-100 dark:bg-amber-700/50 px-3 sm:px-4 py-1 sm:py-2 rounded-lg border border-amber-300 dark:border-amber-600">
								<Users className="h-4 w-4 sm:h-5 sm:w-5" />
								<span className="font-semibold">冒険者ギルド</span>
							</div>
						</div>
					</div>
				</div>

				{boards.length === 0 ? (
					<div className="text-center py-10 sm:py-20">
						<div className="retro-card rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-3 border-amber-400 p-6 sm:p-12 lg:p-16 max-w-sm sm:max-w-lg mx-auto">
							<div className="bg-gradient-to-br from-amber-200 to-amber-300 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 border-2 sm:border-3 border-amber-500 shadow-lg">
								<Scroll className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-amber-700" />
							</div>
							<h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-amber-900 dark:text-amber-100 mb-3 sm:mb-4 tracking-wide">
								📜 クエストボードが空です
							</h2>
							<p className="text-amber-700 dark:text-amber-200 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed">
								新しいクエストボードを作成して、<br className="hidden sm:inline" />
								<span className="sm:hidden"> </span>壮大な冒険を始めましょう！
							</p>
							<CreateBoardDialog />
						</div>
					</div>
				) : (
					<BoardGrid boards={boards} />
				)}
			</div>

			{/* フッター */}
			<div className="retro-sign text-white py-6 mt-20 relative">
				<div className="absolute inset-0 border-2 border-amber-600 rounded-lg m-3"></div>
				<div className="container mx-auto px-6 text-center relative z-10">
					<p className="text-amber-200 text-lg font-medium tracking-wide">
						© 2024 🏛️ 冒険者ギルド - すべてのクエストを管理 ⚔️
					</p>
				</div>
			</div>
		</div>
	);
}
