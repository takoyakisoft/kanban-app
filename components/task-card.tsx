"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { EditTaskDialog } from "./edit-task-dialog"

interface Task {
  id: string
  title: string
  description: string | null
  position: number
  priority: string
  dueDate: Date | null
  columnId: string
}

interface TaskCardProps {
  task: Task
  isDragging?: boolean
}

export function TaskCard({ task, isDragging = false }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isCurrentlyDragging = isDragging || isSortableDragging

  const getPriorityDisplay = (priority: string) => {
    switch (priority) {
      case 'URGENT': return { emoji: '🔴', text: '緊急', bg: 'bg-red-100 text-red-700 border-red-300' };
      case 'HIGH': return { emoji: '🟠', text: '危険', bg: 'bg-orange-100 text-orange-700 border-orange-300' };
      case 'MEDIUM': return { emoji: '🟡', text: '注意', bg: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
      case 'LOW': return { emoji: '🟢', text: '安全', bg: 'bg-green-100 text-green-700 border-green-300' };
      default: return { emoji: '⚪', text: '不明', bg: 'bg-gray-100 text-gray-700 border-gray-300' };
    }
  };

  const priorityInfo = getPriorityDisplay(task.priority);

  // ドラッグ中の場合は、DnD属性なしでレンダリング
  if (isDragging) {
    return (
      <div
        className={`retro-card rounded-lg p-4 border-2 border-amber-300 hover:shadow-lg transition-all duration-200 ${
          isCurrentlyDragging ? 'opacity-50 rotate-3 shadow-xl scale-105' : ''
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-amber-900 dark:text-amber-100 flex-1 tracking-wide">
            ⚔️ {task.title}
          </h3>
        </div>
        {task.description && (
          <p className="text-sm text-amber-700 dark:text-amber-200 line-clamp-2 mb-3">
            {task.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded-full border font-medium ${priorityInfo.bg}`}>
            {priorityInfo.emoji} {priorityInfo.text}
          </span>
          {task.dueDate && (
            <span className="text-xs text-amber-600 font-medium">
              📅 {new Date(task.dueDate).toLocaleDateString('ja-JP')}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        // ドラッグ中は透明にして、下のドロップゾーンが見えるようにする
        opacity: isSortableDragging ? 0.1 : 1,
        // ドラッグ中はポインターイベントを無効化
        pointerEvents: isSortableDragging ? 'none' : 'auto',
      }}
      {...(isSortableDragging ? {} : attributes)}
      {...(isSortableDragging ? {} : listeners)}
      className={`retro-card rounded-lg p-4 border-2 border-amber-300 hover:shadow-lg hover:border-amber-400 transition-all duration-200 cursor-grab active:cursor-grabbing ${
        isCurrentlyDragging ? 'rotate-1 shadow-xl scale-105' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-amber-900 flex-1 tracking-wide">
          ⚔️ {task.title}
        </h3>
        <EditTaskDialog task={task} />
      </div>
      {task.description && (
        <p className="text-sm text-amber-700 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${priorityInfo.bg}`}>
          {priorityInfo.emoji} {priorityInfo.text}
        </span>
        {task.dueDate && (
          <span className="text-xs text-amber-600 font-medium">
            📅 {new Date(task.dueDate).toLocaleDateString('ja-JP')}
          </span>
        )}
      </div>
    </div>
  )
}