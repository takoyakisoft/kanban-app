"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { createTask } from "@/app/actions/task"
// Removed dialog imports - using custom modal
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toaster"
import { Plus, Sword, X } from "lucide-react"

interface CreateTaskDialogProps {
  columnId: string
  columnTitle: string
}

export function CreateTaskDialog({ columnId, columnTitle }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      // columnIdを追加
      formData.append('columnId', columnId)
      await createTask(formData)
      const title = formData.get('title') as string
      toast({
        title: "⚔️ 新しいクエストを受注しました！",
        description: `「${title}」の挑戦が始まります`,
        variant: "retro",
        duration: 3000
      })
      setOpen(false)
      // 成功後にページを再読み込みして最新データを取得
      window.location.reload()
    } catch (error) {
      console.error('タスク作成エラー:', error)
      toast({
        title: "⚠️ クエスト受注に失敗しました",
        description: "もう一度お試しください",
        variant: "destructive",
        duration: 5000
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <Button
        onClick={() => setOpen(true)}
        variant="retro"
        size="sm"
        className="w-full"
      >
        <Sword className="h-4 w-4 mr-2" />
        新しいクエスト
      </Button>
      
      {open && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-[1000000] w-full max-w-2xl retro-card border-amber-400 p-6 rounded-lg max-h-[90vh] overflow-y-auto">
            <button
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-amber-600 dark:text-amber-300 hover:text-amber-700 dark:hover:text-amber-200"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
            <div className="flex items-center gap-2 mb-4">
              <Sword className="h-5 w-5 text-amber-600" />
              <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100">
                新しいクエストを受注
              </h2>
            </div>
            <p className="text-amber-700 dark:text-amber-200 text-sm mb-6">
              {columnTitle}に新しいクエストを追加します。
            </p>
        
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-amber-800 font-semibold">クエスト名 *</Label>
            <Input
              id="title"
              name="title"
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
              defaultValue="MEDIUM"
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
              {isSubmitting ? "受注中" : "⚔️ クエスト受注"}
            </Button>
          </div>
        </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}