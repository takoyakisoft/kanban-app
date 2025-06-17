"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { updateBoard, deleteBoard } from "@/app/actions/board";
// Removed dialog imports - using custom modal
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toaster";
import { Edit, Trash2, Settings, Scroll, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Board {
	id: string;
	title: string;
	description: string | null;
}

interface EditBoardDialogProps {
	board: Board;
	variant?: "icon" | "settings";
}

export function EditBoardDialog({
	board,
	variant = "icon",
}: EditBoardDialogProps) {
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const { toast } = useToast();
	const router = useRouter();

	const handleUpdate = async (formData: FormData) => {
		setIsSubmitting(true);
		try {
			await updateBoard(board.id, formData);
			toast({
				title: "📝 クエストボードを更新しました",
				description: "変更が正常に保存されました",
				variant: "retro",
				duration: 3000,
			});
			setOpen(false);
			window.location.reload();
		} catch (error) {
			console.error("ボード更新エラー:", error);
			toast({
				title: "⚠️ 更新に失敗しました",
				description: "もう一度お試しください",
				variant: "destructive",
				duration: 5000,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await deleteBoard(board.id);
			toast({
				title: "🗑️ クエストボードを削除しました",
				description: "ボードとすべてのクエストが削除されました",
				variant: "warning",
				duration: 4000,
			});
			setOpen(false);
			setShowDeleteDialog(false);
			router.push("/");
		} catch (error) {
			console.error("ボード削除エラー:", error);
			toast({
				title: "⚠️ 削除に失敗しました",
				description: "もう一度お試しください",
				variant: "destructive",
				duration: 5000,
			});
		} finally {
			setIsDeleting(false);
		}
	};

	const TriggerButton =
		variant === "settings" ? (
			<Button
				onClick={() => setOpen(true)}
				variant="outline"
				size="sm"
				className="flex items-center gap-2 bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-600 hover:bg-amber-50 dark:hover:bg-slate-700"
			>
				<Settings className="h-4 w-4" />
				ボード設定
			</Button>
		) : (
			<Button
				onClick={() => setOpen(true)}
				variant="ghost"
				size="sm"
				className="h-6 w-6 p-0 hover:bg-gray-200"
			>
				<Edit className="h-3 w-3" />
			</Button>
		);

	return (
		<div>
			{TriggerButton}

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
									クエストボードを編集
								</h2>
							</div>
							<p className="text-amber-700 dark:text-amber-200 text-sm mb-6">
								ボードの詳細を編集できます。
							</p>

							<form action={handleUpdate} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="title">タイトル *</Label>
									<Input
										id="title"
										name="title"
										defaultValue={board.title}
										placeholder="ボードのタイトルを入力"
										required
										disabled={isSubmitting}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="description">説明</Label>
									<Textarea
										id="description"
										name="description"
										defaultValue={board.description || ""}
										placeholder="ボードの説明を入力（任意）"
										rows={3}
										disabled={isSubmitting}
									/>
								</div>

								<div className="flex justify-between">
									<Button
										type="button"
										variant="destructive"
										onClick={handleDelete}
										disabled={isSubmitting || isDeleting}
										className="flex items-center gap-2"
									>
										<Trash2 className="h-4 w-4" />
										{isDeleting ? "削除中..." : "ボードを削除"}
									</Button>

									<div className="flex space-x-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => setOpen(false)}
											disabled={isSubmitting || isDeleting}
										>
											キャンセル
										</Button>
										<Button
											type="submit"
											disabled={isSubmitting || isDeleting}
											className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
										>
											{isSubmitting ? "更新中..." : "更新"}
										</Button>
									</div>
								</div>
							</form>
						</div>
					</div>,
					document.body,
				)}
		</div>
	);
}
