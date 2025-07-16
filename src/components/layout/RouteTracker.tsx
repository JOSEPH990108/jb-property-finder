'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView } from '@/lib/tracking'
import { useConsentStore } from '@/stores/consentStore'

export default function RouteTracker() {
  const pathname = usePathname()
  const { accepted } = useConsentStore()

  useEffect(() => {
    if (accepted) trackPageView(pathname)
  }, [pathname, accepted])

  return null
}
