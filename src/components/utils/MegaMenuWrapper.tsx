import { ReactNode } from 'react'

export default function MegaMenuWrapper({ children }: { children: ReactNode[] | ReactNode }) {
  const childCount = Array.isArray(children) ? children.length : 1
  const columns = Math.min(childCount, 3)

  return (
    <div
      className={`bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-6 grid gap-6 ${
        columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-2' : 'grid-cols-3'
      }`}
    >
      {children}
    </div>
  )
}
