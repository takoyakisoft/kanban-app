"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { BoardCard } from "./board-card"
import { updateBoardPosition } from "@/app/actions/board"

interface Board {
  id: string
  title: string
  description: string | null
  position: number
  createdAt: Date
  updatedAt: Date
  columns: Array<{
    id: string
    title: string
    position: number
    tasks: Array<{ id: string }>
  }>
}

interface BoardGridProps {
  boards: Board[]
}

export function BoardGrid({ boards: initialBoards }: BoardGridProps) {
  const [boards, setBoards] = useState(initialBoards)
  const [activeBoard, setActiveBoard] = useState<Board | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const board = boards.find(board => board.id === active.id)
    setActiveBoard(board || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveBoard(null)

    if (!over || active.id === over.id) return

    const activeBoard = boards.find(board => board.id === active.id)
    const overBoard = boards.find(board => board.id === over.id)

    if (!activeBoard || !overBoard) return

    const oldIndex = boards.findIndex(board => board.id === active.id)
    const newIndex = boards.findIndex(board => board.id === over.id)

    if (oldIndex === newIndex) return

    // UIを即座に更新
    const newBoards = arrayMove(boards, oldIndex, newIndex)
    setBoards(newBoards)

    // サーバーに位置の更新を送信
    try {
      await updateBoardPosition(activeBoard.id, newIndex)
    } catch (error) {
      console.error('ボードの移動に失敗しました:', error)
      // エラーの場合は元の状態に戻す
      setBoards(initialBoards)
    }
  }

  // クライアントサイドでのみドラッグ&ドロップ機能を有効にする
  if (!isClient) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boards.map((board, index) => (
          <div key={board.id} className="stagger-item" style={{animationDelay: `${index * 0.1}s`}}>
            <BoardCard board={board} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={boards.map(board => board.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board, index) => (
            <div key={board.id} className="stagger-item" style={{animationDelay: `${index * 0.1}s`}}>
              <BoardCard board={board} />
            </div>
          ))}
        </div>
      </SortableContext>
      
      <DragOverlay>
        {activeBoard ? <BoardCard board={activeBoard} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}