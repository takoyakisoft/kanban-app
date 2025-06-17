import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Scroll, Sword, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/kanban-board";
import { EditBoardDialog } from "@/components/edit-board-dialog";

interface BoardPageProps {
  params: Promise<{
    boardId: string;
  }>;
}

async function getBoard(boardId: string) {
  try {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              orderBy: { position: 'asc' }
            }
          }
        }
      }
    });
    return board;
  } catch (error) {
    console.error('ボード取得エラー:', error);
    return null;
  }
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params;
  const board = await getBoard(boardId);

  if (!board) {
    notFound();
  }

  const totalTasks = board.columns.reduce((total, column) => total + column.tasks.length, 0);
  const completedTasks = board.columns
    .find(col => col.position === 2 || col.title.toLowerCase().includes('done'))?.tasks.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-red-100 dark:from-slate-900 dark:via-slate-800 dark:to-amber-900/20">
      {/* ヘッダー - レスポンシブな看板風デザイン */}
      <div className="retro-sign text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 border-2 sm:border-4 border-amber-600 rounded-lg m-1 sm:m-2"></div>
        <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 lg:gap-6 fade-in-left w-full lg:w-auto">
              <Link href="/" className="self-start sm:self-auto">
                <Button variant="retro" size="sm" className="bg-amber-600 hover:bg-amber-700 bounce-in touch-target">
                  <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">ギルドに戻る</span>
                  <span className="sm:hidden">戻る</span>
                </Button>
              </Link>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-amber-700 p-2 sm:p-3 rounded-full border-2 sm:border-3 border-amber-500 shadow-lg bounce-in" style={{animationDelay: '0.2s'}}>
                  <Scroll className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-amber-100" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-wider text-amber-100 drop-shadow-lg fade-in-up" style={{animationDelay: '0.3s'}}>
                    📋 {board.title}
                  </h1>
                  {board.description && (
                    <p className="text-amber-200 text-sm sm:text-base lg:text-lg font-medium tracking-wide mt-1 fade-in-up" style={{animationDelay: '0.4s'}}>
                      {board.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 lg:gap-6 fade-in-right w-full lg:w-auto">
              {/* 統計表示 */}
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                <div className="text-center bg-amber-600/30 dark:bg-amber-600/40 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-amber-500 dark:border-amber-400 pulse-glow stagger-item">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white dark:text-amber-100 drop-shadow">{totalTasks}</div>
                  <div className="text-xs text-white dark:text-amber-100 font-medium">総クエスト</div>
                </div>
                <div className="text-center bg-amber-600/30 dark:bg-amber-600/40 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-amber-500 dark:border-amber-400 pulse-glow stagger-item">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white dark:text-amber-100 drop-shadow">{completedTasks}</div>
                  <div className="text-xs text-white dark:text-amber-100 font-medium">完了</div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="stagger-item">
                  <EditBoardDialog board={board} variant="settings" />
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
      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* サブヘッダー */}
        <div className="mb-6 sm:mb-8 fade-in-up" style={{animationDelay: '0.5s'}}>
          <div className="retro-card rounded-lg sm:rounded-xl shadow-lg border-2 border-amber-300 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <Sword className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 bounce-in flex-shrink-0" style={{animationDelay: '0.6s'}} />
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-amber-900 dark:text-amber-100 tracking-wide">
                    ⚔️ クエスト進行状況
                  </h2>
                  <p className="text-amber-700 dark:text-amber-200 text-sm font-medium">
                    <span className="hidden sm:inline">ドラッグ&ドロップでクエストを移動できます</span>
                    <span className="sm:hidden">タップして編集</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-200 bg-amber-100 dark:bg-amber-700/50 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-amber-300 dark:border-amber-600 pulse-glow">
                <Shield className="h-4 w-4" />
                <span className="font-semibold">{board.columns.length} ステージ</span>
              </div>
            </div>
          </div>
        </div>

        <KanbanBoard columns={board.columns} />
      </div>
    </div>
  );
}