"use client"

import { useState } from "react"
import { updateTask, deleteTask } from "@/app/actions/task"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toaster"
import { Edit, Trash2, Sword } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string | null
  priority: string
  dueDate: Date | null
}

interface EditTaskDialogProps {
  task: Task
}

export function EditTaskDialog({ task }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleUpdate = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      await updateTask(task.id, formData)
      toast({
        title: "📝 クエストを更新しました",
        description: "変更が正常に保存されました",
        variant: "retro",
        duration: 3000
      })
      setOpen(false)
      window.location.reload()
    } catch (error) {
      console.error('タスク更新エラー:', error)
      toast({
        title: "⚠️ 更新に失敗しました",
        description: "もう一度お試しください",
        variant: "destructive",
        duration: 5000
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteTask(task.id)
      toast({
        title: "🗑️ クエストを削除しました",
        description: "クエストが正常に削除されました",
        variant: "warning",
        duration: 4000
      })
      setOpen(false)
      window.location.reload()
    } catch (error) {
      console.error('タスク削除エラー:', error)
      toast({
        title: "⚠️ 削除に失敗しました",
        description: "もう一度お試しください",
        variant: "destructive",
        duration: 5000
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDateForInput = (date: Date | null) => {
    if (!date) return ''
    return new Date(date).toISOString().split('T')[0]
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        onClick={() => setOpen(true)}
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-amber-100 text-amber-600 hover:text-amber-700"
      >
        <Edit className="h-3 w-3" />
      </Button>
      
      <DialogContent className="sm:max-w-[425px] retro-card border-amber-400">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-amber-900 flex items-center gap-2">
            <Sword className="h-5 w-5 text-amber-600" />
            クエストを編集
          </DialogTitle>
          <DialogDescription className="text-amber-700">
            クエストの詳細を編集できます。
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-amber-800 font-semibold">クエスト名 *</Label>
            <Input
              id="title"
              name="title"
              defaultValue={task.title}
              placeholder="例: ドラゴン討伐の任務"
              required
              disabled={isSubmitting}
              className="border-amber-300 focus:border-amber-500 bg-amber-50/50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-amber-800 font-semibold">クエストの詳細</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={task.description || ''}
              placeholder="クエストの内容や条件を記録してください..."
              rows={3}
              disabled={isSubmitting}
              className="border-amber-300 focus:border-amber-500 bg-amber-50/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority" className="text-amber-800 font-semibold">危険度</Label>
            <select
              id="priority"
              name="priority"
              defaultValue={task.priority}
              className="w-full p-2 border border-amber-300 rounded-md bg-amber-50/50 focus:border-amber-500 text-amber-800"
              disabled={isSubmitting}
            >
              <option value="LOW">🟢 安全</option>
              <option value="MEDIUM">🟡 注意</option>
              <option value="HIGH">🟠 危険</option>
              <option value="URGENT">🔴 緊急</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-amber-800 font-semibold">期限</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              defaultValue={formatDateForInput(task.dueDate)}
              disabled={isSubmitting}
              className="border-amber-300 focus:border-amber-500 bg-amber-50/50"
            />
          </div>
          
          <div className="flex justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isSubmitting || isDeleting}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  🗑️ クエスト削除
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>クエストを削除しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    この操作は取り消せません。クエスト「{task.title}」が完全に削除されます。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? "削除中..." : "削除する"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting || isDeleting}
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isDeleting}
                variant="retro"
                className={isSubmitting ? "loading-dots" : ""}
              >
                {isSubmitting ? "更新中" : "📝 クエスト更新"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}