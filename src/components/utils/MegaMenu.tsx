// MegaMenu.tsx
import Link from 'next/link'

export default function MegaMenu() {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-screen max-w-4xl bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-6 grid grid-cols-3 gap-6 z-50 transition-all duration-300">
      <div>
        <h4 className="font-semibold text-primary mb-2">New Projects</h4>
        <ul className="space-y-1 text-sm">
          <li><Link href="/projects/new" className="hover:underline text-zinc-700 dark:text-zinc-300">All New Projects</Link></li>
          <li><Link href="/projects/new?area=jb" className="hover:underline text-zinc-700 dark:text-zinc-300">Johor Bahru</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-primary mb-2">Sub-Sale</h4>
        <ul className="space-y-1 text-sm">
          <li><Link href="/projects/sub-sale" className="hover:underline text-zinc-700 dark:text-zinc-300">All Sub-Sales</Link></li>
          <li><Link href="/projects/sub-sale?type=condo" className="hover:underline text-zinc-700 dark:text-zinc-300">Condo</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-primary mb-2">Rental</h4>
        <ul className="space-y-1 text-sm">
          <li><Link href="/projects/rent" className="hover:underline text-zinc-700 dark:text-zinc-300">All Rentals</Link></li>
          <li><Link href="/projects/rent?area=skudai" className="hover:underline text-zinc-700 dark:text-zinc-300">Skudai Area</Link></li>
        </ul>
      </div>
    </div>
  )
}
