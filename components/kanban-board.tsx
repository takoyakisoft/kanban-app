"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { KanbanColumn } from "./kanban-column"
import { TaskCard } from "./task-card"
import { updateTaskPosition } from "@/app/actions/task"

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

interface KanbanBoardProps {
  columns: Column[]
}

export function KanbanBoard({ columns: initialColumns }: KanbanBoardProps) {
  const [columns, setColumns] = useState(initialColumns)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [lastDropZone, setLastDropZone] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)
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
    const task = findTask(active.id as string)
    setActiveTask(task)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const activeTask = findTask(activeId)
    const overTask = findTask(overId)

    if (!activeTask) return

    // ドロップゾーンの場合の処理
    if (overId.endsWith('-drop-zone')) {
      const targetColumnId = overId.replace('-drop-zone', '')
      setLastDropZone(overId) // ドロップゾーン情報を保存
      
      if (activeTask.columnId !== targetColumnId) {
        setColumns((columns) => {
          const activeColumnIndex = columns.findIndex(col => col.id === activeTask.columnId)
          const overColumnIndex = columns.findIndex(col => col.id === targetColumnId)

          if (activeColumnIndex === -1 || overColumnIndex === -1) return columns

          const newColumns = [...columns]
          
          // アクティブなタスクを元のカラムから削除
          newColumns[activeColumnIndex] = {
            ...newColumns[activeColumnIndex],
            tasks: newColumns[activeColumnIndex].tasks.filter(task => task.id !== activeId)
          }

          // 新しいカラムにタスクを追加（空のカラムなので末尾に）
          const overColumn = newColumns[overColumnIndex]
          const updatedTask = { ...activeTask, columnId: overColumn.id }
          newColumns[overColumnIndex] = {
            ...overColumn,
            tasks: [...overColumn.tasks, updatedTask]
          }

          return newColumns
        })
      }
      return
    }

    // タスクを別のカラムに移動する場合
    if (activeTask.columnId !== getColumnId(overId)) {
      setColumns((columns) => {
        const activeColumnIndex = columns.findIndex(col => col.id === activeTask.columnId)
        const overColumnIndex = columns.findIndex(col => col.id === getColumnId(overId))

        if (activeColumnIndex === -1 || overColumnIndex === -1) return columns

        const newColumns = [...columns]
        
        // アクティブなタスクを元のカラムから削除
        newColumns[activeColumnIndex] = {
          ...newColumns[activeColumnIndex],
          tasks: newColumns[activeColumnIndex].tasks.filter(task => task.id !== activeId)
        }

        // 新しいカラムにタスクを追加
        const overColumn = newColumns[overColumnIndex]
        let insertIndex = overColumn.tasks.length

        if (overTask) {
          insertIndex = overColumn.tasks.findIndex(task => task.id === overId)
        }

        const updatedTask = { ...activeTask, columnId: overColumn.id }
        newColumns[overColumnIndex] = {
          ...overColumn,
          tasks: [
            ...overColumn.tasks.slice(0, insertIndex),
            updatedTask,
            ...overColumn.tasks.slice(insertIndex)
          ]
        }

        return newColumns
      })
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    const currentActiveTask = activeTask
    setActiveTask(null)

    if (!over && !lastDropZone) {
      setLastDropZone(null)
      return
    }

    const activeId = active.id as string
    let overId = over?.id as string

    // lastDropZoneがある場合は、それを優先使用
    if (lastDropZone) {
      overId = lastDropZone
      setLastDropZone(null) // リセット
    }

    // ドロップゾーンの場合は強制的に処理を続行
    if (activeId === overId && !overId.endsWith('-drop-zone')) {
      return
    }
    
    // ドロップゾーンの場合の処理
    if (overId.endsWith('-drop-zone')) {
      const targetColumnId = overId.replace('-drop-zone', '')
      const newPosition = 0 // 空のカラムなので位置0
      
      if (!currentActiveTask) {
        return
      }
      
      try {
        await updateTaskPosition(currentActiveTask.id, targetColumnId, newPosition)
        window.location.reload()
      } catch (error) {
        console.error('タスクの移動に失敗しました:', error)
        setColumns(initialColumns)
      }
      return
    }

    if (!currentActiveTask) {
      return
    }

    const newColumnId = getColumnId(overId)
    const newColumn = columns.find(col => col.id === newColumnId)
    if (!newColumn) {
      return
    }

    // 新しい位置を計算
    let newPosition = 0
    
    if (currentActiveTask.columnId === newColumnId) {
      // 同じカラム内での並び替え
      const overTask = findTask(overId)
      if (overTask) {
        newPosition = overTask.position
      }
    } else {
      // 異なるカラム間での移動
      if (overId.endsWith('-drop-zone')) {
        // ドロップゾーンにドロップした場合は最後に追加
        newPosition = newColumn.tasks.length
      } else {
        // 既存のタスクの位置に挿入
        const overTask = findTask(overId)
        if (overTask) {
          newPosition = overTask.position
        } else {
          newPosition = newColumn.tasks.length
        }
      }
    }

    // UIを即座に更新
    setColumns((columns) => {
      const newColumns = [...columns]
      
      if (currentActiveTask.columnId === newColumnId) {
        // 同じカラム内での並び替え
        const columnIndex = columns.findIndex(col => col.id === newColumnId)
        if (columnIndex === -1) return columns

        const column = columns[columnIndex]
        const oldIndex = column.tasks.findIndex(task => task.id === activeId)
        const overTask = findTask(overId)
        let newIndex = column.tasks.length - 1

        if (overTask) {
          newIndex = column.tasks.findIndex(task => task.id === overId)
        }

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const newTasks = arrayMove(column.tasks, oldIndex, newIndex)
          newColumns[columnIndex] = { ...column, tasks: newTasks }
        }
      } else {
        // 異なるカラム間での移動
        const oldColumnIndex = columns.findIndex(col => col.id === currentActiveTask.columnId)
        const newColumnIndex = columns.findIndex(col => col.id === newColumnId)
        
        if (oldColumnIndex !== -1 && newColumnIndex !== -1) {
          // 元のカラムからタスクを削除
          newColumns[oldColumnIndex] = {
            ...newColumns[oldColumnIndex],
            tasks: newColumns[oldColumnIndex].tasks.filter(task => task.id !== activeId)
          }
          
          // 新しいカラムにタスクを追加
          const updatedTask = { ...currentActiveTask, columnId: newColumnId }
          newColumns[newColumnIndex] = {
            ...newColumns[newColumnIndex],
            tasks: [...newColumns[newColumnIndex].tasks, updatedTask]
          }
        }
      }
      
      return newColumns
    })

    // サーバーに位置の更新を送信
    try {
      await updateTaskPosition(currentActiveTask.id, newColumnId, newPosition)
      window.location.reload()
    } catch (error) {
      console.error('タスクの移動に失敗しました:', error)
      setColumns(initialColumns)
    }
  }

  const findTask = (id: string): Task | null => {
    for (const column of columns) {
      const task = column.tasks.find(task => task.id === id)
      if (task) return task
    }
    return null
  }

  const getColumnId = (id: string): string => {
    // ドロップゾーンIDの場合（例: "column-id-drop-zone"）
    if (id.endsWith('-drop-zone')) {
      const columnId = id.replace('-drop-zone', '')
      const column = columns.find(col => col.id === columnId)
      if (column) {
        return columnId
      }
    }
    
    // タスクIDの場合は、そのタスクが属するカラムIDを返す
    const task = findTask(id)
    if (task) {
      return task.columnId
    }
    
    // カラムIDかどうかチェック
    const column = columns.find(col => col.id === id)
    if (column) {
      return id
    }
    
    // 最後の手段として、最初のカラムIDを返す
    return columns[0]?.id || id
  }

  const calculateNewPosition = (taskId: string, newColumnId: string): number => {
    const column = columns.find(col => col.id === newColumnId)
    if (!column) return 0

    const taskIndex = column.tasks.findIndex(task => task.id === taskId)
    return taskIndex >= 0 ? taskIndex : column.tasks.length
  }

  // ハイドレーション不一致を防ぐため、クライアントサイドでのみDnDを有効化
  if (!isMounted) {
    return (
      <div className="flex gap-6 overflow-x-auto pb-4 min-w-max">
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column} />
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-4 min-w-max">
        {columns.map((column) => (
          <SortableContext
            key={column.id}
            items={[...column.tasks.map(task => task.id), `${column.id}-drop-zone`]}
            strategy={verticalListSortingStrategy}
          >
            <KanbanColumn column={column} />
          </SortableContext>
        ))}
      </div>
      
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}