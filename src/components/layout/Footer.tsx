// src\components\layout\Footer.tsx
'use client'

export default function Footer() {
  return (
    <footer className="bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 py-8 px-4 mt-16 border-t dark:border-zinc-700">
      <div className="max-w-7xl mx-auto text-center text-sm">
        © {new Date().getFullYear()} JB Property Finder. All rights reserved.
      </div>
    </footer>
  )
}
