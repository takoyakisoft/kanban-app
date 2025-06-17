"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { Calendar, Users, Layers } from "lucide-react";
import { EditBoardDialog } from "./edit-board-dialog";
import { useState, useEffect } from "react";

interface Board {
	id: string;
	title: string;
	description: string | null;
	position: number;
	createdAt: Date;
	updatedAt: Date;
	columns: Array<{
		id: string;
		title: string;
		position: number;
		tasks: Array<{ id: string }>;
	}>;
}

interface BoardCardProps {
	board: Board;
	isDragging?: boolean;
}

export function BoardCard({ board, isDragging = false }: BoardCardProps) {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging: isSortableDragging,
	} = useSortable({
		id: board.id,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const isCurrentlyDragging = isDragging || isSortableDragging;
	const totalTasks = board.columns.reduce(
		(total, column) => total + column.tasks.length,
		0,
	);

	const CardContent = (
		<div
			className={`retro-card rounded-xl hover:shadow-lg transition-all duration-300 ${
				isCurrentlyDragging ? "opacity-50 rotate-2 shadow-xl scale-105" : ""
			}`}
		>
			<div className="p-6">
				{/* ヘッダー部分 */}
				<div className="flex items-start justify-between mb-4">
					<div className="flex-1">
						<h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-1 line-clamp-1 tracking-wide">
							{board.title}
						</h3>
						{board.description && (
							<p className="text-amber-700 dark:text-amber-200 text-sm line-clamp-2 mb-3">
								{board.description}
							</p>
						)}
					</div>
					<div className="flex items-center gap-1">
						<EditBoardDialog board={board} variant="icon" />
						<div
							className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100"
							{...attributes}
							{...listeners}
						>
							<svg
								className="w-4 h-4 text-gray-400"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
							</svg>
						</div>
					</div>
				</div>

				{/* 統計情報 */}
				<div className="grid grid-cols-2 gap-4 mb-4">
					<div className="flex items-center text-sm text-amber-700 dark:text-amber-200 font-medium">
						<Layers className="w-4 h-4 mr-2 text-amber-600 dark:text-amber-300" />
						<span>{board.columns.length} カラム</span>
					</div>
					<div className="flex items-center text-sm text-amber-700 dark:text-amber-200 font-medium">
						<Users className="w-4 h-4 mr-2 text-amber-600 dark:text-amber-300" />
						<span>{totalTasks} タスク</span>
					</div>
				</div>

				{/* 作成日 */}
				<div className="flex items-center text-xs text-amber-600 dark:text-amber-300">
					<Calendar className="w-3 h-3 mr-1" />
					<span>
						{new Date(board.createdAt).toLocaleDateString("ja-JP", {
							year: "numeric",
							month: "short",
							day: "numeric",
						})}
					</span>
				</div>

				{/* プログレスバー（タスクの進捗） */}
				{totalTasks > 0 &&
					(() => {
						// Doneカラムを正しく特定（位置2またはタイトルで判定）
						const doneColumn = board.columns.find(
							(col) =>
								col.position === 2 || col.title.toLowerCase().includes("done"),
						);
						const doneTasks = doneColumn?.tasks.length || 0;
						const progressPercentage = Math.round(
							(doneTasks / totalTasks) * 100,
						);

						return (
							<div className="mt-4">
								<div className="flex justify-between text-xs text-gray-500 mb-1">
									<span>進捗</span>
									<span>{progressPercentage}%</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2">
									<div
										className="bg-green-500 h-2 rounded-full transition-all duration-300"
										style={{ width: `${progressPercentage}%` }}
									/>
								</div>
							</div>
						);
					})()}
			</div>
		</div>
	);

	if (isDragging) {
		return (
			<div ref={setNodeRef} style={style}>
				{CardContent}
			</div>
		);
	}

	return (
		<div ref={setNodeRef} style={style}>
			<Link href={`/boards/${board.id}`} className="block">
				{CardContent}
			</Link>
		</div>
	);
}
