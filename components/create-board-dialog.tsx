"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { createBoard } from "@/app/actions/board";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toaster";
import { Plus, Scroll, X } from "lucide-react";

export function CreateBoardDialog() {
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { toast } = useToast();

	const handleSubmit = async (formData: FormData) => {
		setIsSubmitting(true);
		try {
			await createBoard(formData);
			const title = formData.get("title") as string;
			setOpen(false);
			// 少し遅延させてからトーストを表示
			setTimeout(() => {
				toast({
					title: "🎉 新しいクエストボードを作成しました！",
					description: `「${title}」の冒険が始まります`,
					variant: "retro",
					duration: 4000,
				});
			}, 100);
		} catch (error) {
			console.error("ボード作成エラー:", error);
			toast({
				title: "⚠️ ボード作成に失敗しました",
				description: "もう一度お試しください",
				variant: "destructive",
				duration: 5000,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div>
			<Button
				onClick={() => setOpen(true)}
				variant="retro"
				className="shadow-lg hover:shadow-xl transition-all duration-200"
			>
				<Scroll className="h-4 w-4 mr-2" />
				新しいクエストボード
			</Button>

			{open &&
				createPortal(
					<div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
						<div
							className="fixed inset-0 bg-black/80 backdrop-blur-sm"
							onClick={() => setOpen(false)}
						/>
						<div className="relative z-[1000000] w-full max-w-2xl retro-card border-amber-400 p-6 rounded-lg max-h-[90vh] overflow-y-auto">
							<button
								className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-amber-600 dark:text-amber-300 hover:text-amber-700 dark:hover:text-amber-200"
								onClick={() => setOpen(false)}
							>
								<X className="h-4 w-4" />
								<span className="sr-only">Close</span>
							</button>
							<div className="flex items-center gap-2 mb-4">
								<Scroll className="h-5 w-5 text-amber-600" />
								<h2 className="text-xl font-bold text-amber-900 dark:text-amber-100">
									新しいクエストボードを作成
								</h2>
							</div>
							<p className="text-amber-700 dark:text-amber-200 text-sm mb-6">
								冒険者たちのクエストを管理するためのボードを作成します。
							</p>

							<form action={handleSubmit} className="space-y-6">
								<div className="space-y-2">
									<Label
										htmlFor="title"
										className="text-amber-800 font-semibold"
									>
										クエストボード名 *
									</Label>
									<Input
										id="title"
										name="title"
										placeholder="例: 伝説の冒険クエスト"
										required
										disabled={isSubmitting}
										className="border-amber-300 focus:border-amber-500 bg-amber-50/50"
									/>
								</div>

								<div className="space-y-2">
									<Label
										htmlFor="description"
										className="text-amber-800 font-semibold"
									>
										クエストの説明
									</Label>
									<Textarea
										id="description"
										name="description"
										placeholder="この冒険の目的や内容を記録してください..."
										rows={3}
										disabled={isSubmitting}
										className="border-amber-300 focus:border-amber-500 bg-amber-50/50"
									/>
								</div>

								<div className="flex justify-end space-x-3">
									<Button
										type="button"
										variant="outline"
										onClick={() => setOpen(false)}
										disabled={isSubmitting}
										className="border-amber-300 text-amber-700 hover:bg-amber-50"
									>
										キャンセル
									</Button>
									<Button
										type="submit"
										disabled={isSubmitting}
										variant="retro"
										className={isSubmitting ? "loading-dots" : ""}
									>
										{isSubmitting ? "作成中" : "🎯 クエスト開始"}
									</Button>
								</div>
							</form>
						</div>
					</div>,
					document.body,
				)}
		</div>
	);
}
