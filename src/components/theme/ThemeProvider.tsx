'use client'

import { useEffect, useState } from 'react'
import { useThemeStore } from '@/stores/themeStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useThemeStore()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const resolved = stored || (prefersDark ? 'dark' : 'light')
    setTheme(resolved)
    setIsMounted(true)
  }, [setTheme])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-zinc-950">
        <div className="w-8 h-8 border-4 border-zinc-300 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
