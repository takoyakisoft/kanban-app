"use client"

import * as React from "react"
import { Toast, ToastTitle, ToastDescription } from "./toast"

interface ToastData {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success" | "warning" | "retro"
  duration?: number
}

interface ToasterContextType {
  toasts: ToastData[]
  toast: (toast: Omit<ToastData, "id">) => void
  dismiss: (id: string) => void
}

const ToasterContext = React.createContext<ToasterContextType | undefined>(undefined)

export function useToast() {
  const context = React.useContext(ToasterContext)
  if (!context) {
    throw new Error("useToast must be used within a ToasterProvider")
  }
  return context
}

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  const toast = React.useCallback((toastData: Omit<ToastData, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toastData, id }
    
    setToasts((prev) => [...prev, newToast])
    
    // Auto dismiss after duration (default 5 seconds)
    setTimeout(() => {
      dismiss(id)
    }, toastData.duration || 5000)
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToasterContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToasterContext.Provider>
  )
}

function Toaster({ toasts, onDismiss }: { toasts: ToastData[], onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          onClose={() => onDismiss(toast.id)}
          className={`mb-2 ${toast.variant === 'retro' ? 'bounce-in' : 'fade-in-right'} ${toast.variant === 'destructive' ? 'shake-on-error' : ''}`}
          style={{animationDelay: `${index * 0.1}s`}}
        >
          {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
          {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
        </Toast>
      ))}
    </div>
  )
}

export { Toaster }