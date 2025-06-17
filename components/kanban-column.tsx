"use client"

import { useDroppable } from "@dnd-kit/core"
import { useSortable } from "@dnd-kit/sortable"
import { TaskCard } from "./task-card"
import { CreateTaskDialog } from "./create-task-dialog"

interface Task {
  id: string
  title: string
  description: string | null
  position: number
  priority: string
  dueDate: Date | null
  columnId: string
}

interface Column {
  id: string
  title: string
  position: number
  color: string
  tasks: Task[]
}

interface KanbanColumnProps {
  column: Column
}

export function KanbanColumn({ column }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  // カラム用のSortable要素（常に表示）
  const {
    setNodeRef: setSortableRef,
    attributes,
    listeners,
  } = useSortable({
    id: `${column.id}-drop-zone`,
    data: {
      type: 'column',
      columnId: column.id,
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 min-w-80 retro-card rounded-lg sm:rounded-xl shadow-lg border-2 transition-all duration-300 ${
        isOver ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-400 shadow-xl scale-105' : 'border-amber-300 dark:border-amber-600'
      }`}
    >
      <div 
        className="p-3 sm:p-4 lg:p-5 border-b-2 border-amber-200 dark:border-amber-600 bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 rounded-t-lg sm:rounded-t-xl"
        style={{ borderTopColor: column.color }}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div 
            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white dark:border-amber-200 shadow-sm flex-shrink-0"
            style={{ backgroundColor: column.color }}
          />
          <h2 className="font-bold text-amber-900 dark:text-amber-100 text-base sm:text-lg tracking-wide truncate">{column.title}</h2>
          <span className="text-xs sm:text-sm text-amber-700 dark:text-amber-200 bg-amber-200 dark:bg-amber-700/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium flex-shrink-0">
            {column.tasks.length}
          </span>
        </div>
      </div>
      
      <div className="p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4 min-h-[150px] sm:min-h-[200px] bg-gradient-to-b from-amber-50/50 to-amber-25/25 dark:from-slate-800/30 dark:to-slate-900/20">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        
        {/* タスクがない場合のみドロップゾーンを表示 */}
        {column.tasks.length === 0 && (
          <div 
            ref={setSortableRef}
            {...attributes}
            {...listeners}
            className="text-center text-amber-600 dark:text-amber-300 rounded-lg border-2 border-dashed border-amber-300 dark:border-amber-600 hover:border-amber-500 dark:hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-200 touch-target py-6 sm:py-10"
            data-column-id={column.id}
          >
            <p className="text-sm sm:text-base font-medium text-amber-700 dark:text-amber-200">📜 クエストがありません</p>
            <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-300 mt-1 sm:mt-2">
              <span className="hidden sm:inline">ここにクエストをドロップ</span>
              <span className="sm:hidden">タップして追加</span>
            </p>
          </div>
        )}
        
        {/* タスクがある場合は非表示のドロップゾーン（ドラッグ&ドロップ機能のため） */}
        {column.tasks.length > 0 && (
          <div 
            ref={setSortableRef}
            {...attributes}
            {...listeners}
            className="opacity-0 h-0 overflow-hidden"
            data-column-id={column.id}
          />
        )}
        
        <CreateTaskDialog columnId={column.id} columnTitle={column.title} />
      </div>
    </div>
  )
}