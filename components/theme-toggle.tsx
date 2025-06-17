"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Lightbulb } from "lucide-react"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // 初期テーマの設定
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    const initialTheme = savedTheme || systemTheme
    
    setTheme(initialTheme)
  }, [])

  const updateTheme = (newTheme: "light" | "dark") => {
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("theme", newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    updateTheme(newTheme)
  }

  // SSR中は基本的なボタンを表示
  if (!mounted) {
    return (
      <Button
        variant="retro"
        size="sm"
        className="relative overflow-hidden group touch-target"
        disabled
      >
        <div className="relative z-10 flex items-center gap-1 sm:gap-2">
          <Moon className="h-4 w-4" />
          <span className="hidden sm:inline">夜の看板</span>
          <span className="sm:hidden text-xs">夜</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-700" />
      </Button>
    )
  }

  return (
    <Button
      onClick={toggleTheme}
      variant="retro"
      size="sm"
      className="relative overflow-hidden group touch-target"
      title={theme === "light" ? "ダークモードに切り替え" : "ライトモードに切り替え"}
    >
      <div className="relative z-10 flex items-center gap-1 sm:gap-2">
        {theme === "light" ? (
          <>
            <Moon className="h-4 w-4" />
            <span className="hidden sm:inline">夜の看板</span>
            <span className="sm:hidden text-xs">夜</span>
          </>
        ) : (
          <>
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">昼の看板</span>
            <span className="sm:hidden text-xs">昼</span>
          </>
        )}
      </div>
      
      {/* アニメーション背景 */}
      <div className={`absolute inset-0 transition-all duration-500 ${
        theme === "dark" 
          ? "bg-gradient-to-r from-amber-600 to-orange-600" 
          : "bg-gradient-to-r from-slate-600 to-slate-700"
      }`} />
    </Button>
  )
}