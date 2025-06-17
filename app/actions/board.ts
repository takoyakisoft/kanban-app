"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";

export async function updateBoardPosition(
	boardId: string,
	newPosition: number,
) {
	try {
		await prisma.$transaction(async (tx) => {
			// 移動するボードの現在の情報を取得
			const currentBoard = await tx.board.findUnique({
				where: { id: boardId },
			});

			if (!currentBoard) {
				throw new Error("ボードが見つかりません");
			}

			const oldPosition = currentBoard.position;

			if (oldPosition === newPosition) return; // 位置が変わらない場合は何もしない

			if (oldPosition < newPosition) {
				// 下に移動する場合：間のボードを上に詰める
				await tx.board.updateMany({
					where: {
						position: {
							gt: oldPosition,
							lte: newPosition,
						},
					},
					data: {
						position: {
							decrement: 1,
						},
					},
				});
			} else {
				// 上に移動する場合：間のボードを下に移動
				await tx.board.updateMany({
					where: {
						position: {
							gte: newPosition,
							lt: oldPosition,
						},
					},
					data: {
						position: {
							increment: 1,
						},
					},
				});
			}

			// 最後にボード自体を新しい位置に移動
			await tx.board.update({
				where: { id: boardId },
				data: {
					position: newPosition,
				},
			});
		});

		// キャッシュを無効化
		revalidatePath("/");
	} catch (error) {
		console.error("ボード位置更新エラー:", error);
		throw new Error("ボードの移動に失敗しました");
	}
}

export async function createBoard(formData: FormData) {
	const title = formData.get("title") as string;
	const description = formData.get("description") as string;

	logger.info("ボード作成開始", { title, description });
	logger.time("ボード作成処理");

	if (!title || title.trim() === "") {
		logger.warn("ボード作成失敗: タイトルが空です", { title });
		throw new Error("タイトルは必須です");
	}

	try {
		// 最大位置を取得
		const maxPosition = await prisma.board.aggregate({
			_max: { position: true },
		});

		const newPosition = (maxPosition._max.position ?? -1) + 1;

		// ボードを作成
		const board = await prisma.board.create({
			data: {
				title: title.trim(),
				description: description?.trim() || null,
				position: newPosition,
			},
		});

		// デフォルトの3つのカラムを作成
		const defaultColumns = [
			{ title: "未着手", position: 0, color: "#ef4444" }, // red-500
			{ title: "進行中", position: 1, color: "#f59e0b" }, // amber-500
			{ title: "完了", position: 2, color: "#10b981" }, // emerald-500
		];

		await prisma.column.createMany({
			data: defaultColumns.map((column) => ({
				...column,
				boardId: board.id,
			})),
		});

		// キャッシュを無効化
		revalidatePath("/");
		revalidatePath(`/boards/${board.id}`);

		logger.info("ボード作成完了", { boardId: board.id, title: board.title });
		logger.timeEnd("ボード作成処理");

		// リダイレクト
		redirect(`/boards/${board.id}`);
	} catch (error) {
		// リダイレクトエラーの場合は正常な動作なので再スロー
		if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
			throw error;
		}
		logger.error("ボード作成エラー", error as Error, { title, description });
		throw new Error("ボードの作成に失敗しました");
	}
}

export async function updateBoard(boardId: string, formData: FormData) {
	const title = formData.get("title") as string;
	const description = formData.get("description") as string;

	if (!title || title.trim() === "") {
		throw new Error("タイトルは必須です");
	}

	try {
		await prisma.board.update({
			where: { id: boardId },
			data: {
				title: title.trim(),
				description: description?.trim() || null,
			},
		});

		revalidatePath("/");
		revalidatePath(`/boards/${boardId}`);
	} catch (error) {
		console.error("ボード更新エラー:", error);
		throw new Error("ボードの更新に失敗しました");
	}
}

export async function deleteBoard(boardId: string) {
	try {
		// カスケード削除でタスクとカラムも削除される
		await prisma.board.delete({
			where: { id: boardId },
		});

		revalidatePath("/");
	} catch (error) {
		console.error("ボード削除エラー:", error);
		throw new Error("ボードの削除に失敗しました");
	}
}
