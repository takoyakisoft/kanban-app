'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateTaskPosition(
  taskId: string,
  newColumnId: string,
  newPosition: number
) {
  console.log('🔄 updateTaskPosition 開始:', {
    taskId,
    newColumnId,
    newPosition,
    timestamp: new Date().toISOString()
  })
  
  try {
    // トランザクション内で位置を更新
    await prisma.$transaction(async (tx) => {
      // 移動するタスクの現在の情報を取得
      const currentTask = await tx.task.findUnique({
        where: { id: taskId },
      })

      if (!currentTask) {
        throw new Error('タスクが見つかりません')
      }

      const oldColumnId = currentTask.columnId
      const oldPosition = currentTask.position

      // 同じカラム内での移動の場合
      if (oldColumnId === newColumnId) {
        if (oldPosition === newPosition) return // 位置が変わらない場合は何もしない

        // 一時的に移動するタスクを負の位置に移動（ユニーク制約回避）
        await tx.task.update({
          where: { id: taskId },
          data: { position: -1 },
        })

        if (oldPosition < newPosition) {
          // 下に移動する場合：間のタスクを上に詰める
          await tx.task.updateMany({
            where: {
              columnId: newColumnId,
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
          })
        } else {
          // 上に移動する場合：間のタスクを下に移動
          await tx.task.updateMany({
            where: {
              columnId: newColumnId,
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
          })
        }

        // 最後にタスクを正しい位置に移動
        await tx.task.update({
          where: { id: taskId },
          data: { position: newPosition },
        })
      } else {
        // 異なるカラム間での移動の場合
        
        console.log('異なるカラム間での移動開始:', {
          taskId,
          oldColumnId,
          oldPosition,
          newColumnId,
          newPosition
        })

        // Step 1: 移動するタスクを一時的に非常に大きな負の位置に移動
        const tempPosition = -999999
        await tx.task.update({
          where: { id: taskId },
          data: { 
            columnId: newColumnId,
            position: tempPosition
          },
        })
        console.log('Step 1: タスクを一時位置に移動完了')

        // Step 2: 元のカラムで、移動したタスクより後ろのタスクを前に詰める
        await tx.task.updateMany({
          where: {
            columnId: oldColumnId,
            position: {
              gt: oldPosition,
            },
          },
          data: {
            position: {
              decrement: 1,
            },
          },
        })
        console.log('Step 2: 元カラムの位置調整完了')

        // Step 3: 新しいカラムで、挿入位置以降のタスクを個別に後ろに移動
        const tasksToMove = await tx.task.findMany({
          where: {
            columnId: newColumnId,
            position: {
              gte: newPosition,
            },
            NOT: { id: taskId }, // 移動中のタスクは除外
          },
          orderBy: { position: 'desc' }, // 後ろから順番に処理
        })
        
        console.log('Step 3: 移動対象タスク:', tasksToMove.length)
        
        // 後ろから順番に1つずつ位置を更新（ユニーク制約回避）
        for (const task of tasksToMove) {
          await tx.task.update({
            where: { id: task.id },
            data: { position: task.position + 1 },
          })
        }
        console.log('Step 3: 新カラムの位置調整完了')

        // Step 4: 最後にタスクを正しい位置に移動
        await tx.task.update({
          where: { id: taskId },
          data: { position: newPosition },
        })
        console.log('Step 4: タスクを最終位置に移動完了')
      }
    })

    // キャッシュを無効化
    revalidatePath('/boards', 'layout')
    
    console.log('✅ updateTaskPosition 成功:', {
      taskId,
      newColumnId,
      newPosition
    })
  } catch (error) {
    console.error('❌ タスク位置更新エラー:', error)
    throw new Error('タスクの移動に失敗しました')
  }
}

export async function createTask(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const columnId = formData.get('columnId') as string
  const priority = formData.get('priority') as string
  const dueDate = formData.get('dueDate') as string

  if (!title || title.trim() === '') {
    throw new Error('タイトルは必須です')
  }

  if (!columnId) {
    throw new Error('カラムIDが必要です')
  }

  try {
    // カラム内の最大位置を取得
    const maxPosition = await prisma.task.aggregate({
      where: { columnId },
      _max: { position: true },
    })

    const newPosition = (maxPosition._max.position ?? -1) + 1

    await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        columnId,
        position: newPosition,
        priority: priority as any || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    })

    revalidatePath('/boards', 'layout')
  } catch (error) {
    console.error('タスク作成エラー:', error)
    throw new Error('タスクの作成に失敗しました')
  }
}

export async function updateTask(
  taskId: string,
  formData: FormData
) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const priority = formData.get('priority') as string
  const dueDate = formData.get('dueDate') as string

  if (!title || title.trim() === '') {
    throw new Error('タイトルは必須です')
  }

  try {
    await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority as any || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    })

    revalidatePath('/boards', 'layout')
  } catch (error) {
    console.error('タスク更新エラー:', error)
    throw new Error('タスクの更新に失敗しました')
  }
}

export async function deleteTask(taskId: string) {
  console.log('🗑️ deleteTask 開始:', {
    taskId,
    timestamp: new Date().toISOString()
  })
  
  try {
    // 削除前にタスクの存在確認
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: { column: true }
    })
    
    if (!existingTask) {
      console.log('❌ タスクが見つかりません:', taskId)
      throw new Error('削除対象のタスクが見つかりません')
    }
    
    console.log('削除対象タスク:', {
      id: existingTask.id,
      title: existingTask.title,
      columnId: existingTask.columnId,
      position: existingTask.position
    })

    await prisma.task.delete({
      where: { id: taskId },
    })

    console.log('✅ deleteTask 成功:', taskId)
    revalidatePath('/boards', 'layout')
  } catch (error) {
    console.error('❌ タスク削除エラー:', error)
    throw new Error('タスクの削除に失敗しました')
  }
}