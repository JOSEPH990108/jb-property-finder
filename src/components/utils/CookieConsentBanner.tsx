// src\components\utils\CookieConsentBanner.tsx
'use client'

import { useEffect } from 'react'
import { useConsentStore } from '@/stores/consentStore'
import { initGA, trackPageView } from '@/lib/tracking'

export default function CookieConsentBanner() {
  const { accepted, setAccepted } = useConsentStore()

  const acceptCookies = () => {
    localStorage.setItem('cookie_consent', 'true')
    setAccepted(true)
    initGA()
    trackPageView(window.location.pathname)
    injectMetaAndTiktokPixels()
  }

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (consent === 'true') {
      setAccepted(true)
      initGA()
      trackPageView(window.location.pathname)
      injectMetaAndTiktokPixels()
    }
  }, [setAccepted])

  if (accepted) return null

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-zinc-900 border-t border-zinc-300 dark:border-zinc-700 p-4 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-zinc-800 dark:text-zinc-200">
        <p>
          We use cookies for site analytics and marketing. By clicking &quot;Accept&quot;, you agree to our use
          of cookies.
        </p>
        <button
          onClick={acceptCookies}
          className="ml-4 px-4 py-2 bg-primary text-white rounded hover:bg-blue-700 transition"
        >
          Accept
        </button>
      </div>
    </div>
  )
}

export function injectMetaAndTiktokPixels() {
  // Meta Pixel
  ;(function (f: any, b: any, e: any, v?: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return
    n = f.fbq = function () {
      n.callMethod
        ? n.callMethod.apply(n, arguments)
        : n.queue.push(arguments)
    }
    if (!f._fbq) f._fbq = n
    n.push = n
    n.loaded = true
    n.version = '2.0'
    n.queue = []
    t = b.createElement(e)
    t.async = true
    t.src = 'https://connect.facebook.net/en_US/fbevents.js'
    s = b.getElementsByTagName(e)[0]
    s?.parentNode?.insertBefore(t, s)
  })(window, document, 'script')

  if (typeof window !== 'undefined' && typeof window.fbq !== 'undefined') {
    window.fbq('init', process.env.NEXT_PUBLIC_META_PIXEL_ID)
    window.fbq('track', 'PageView')
  }

  // TikTok Pixel
  ;(function (w: any, d: Document, t: string) {
    w.TiktokAnalyticsObject = t
    const ttq = (w[t] = w[t] || [])
    ttq.methods = [
      'page', 'track', 'identify', 'instances', 'debug',
      'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie'
    ]
    ttq.setAndDefer = function (t: any, e: any) {
      t[e] = function () {
        t.push([e].concat(Array.prototype.slice.call(arguments, 0)))
      }
    }
    for (let i = 0; i < ttq.methods.length; i++) {
      ttq.setAndDefer(ttq, ttq.methods[i])
    }

    ttq.instance = function (name: string) {
      const instance = ttq._i[name] || []
      for (let i = 0; i < ttq.methods.length; i++) {
        ttq.setAndDefer(instance, ttq.methods[i])
      }
      return instance
    }

    ttq.load = function (id: string) {
      const src = 'https://analytics.tiktok.com/i18n/pixel/events.js'
      ttq._i = ttq._i || {}
      ttq._i[id] = []
      ttq._i[id]._u = src
      ttq._t = ttq._t || {}
      ttq._t[id] = +new Date()
      const script = d.createElement('script')
      script.type = 'text/javascript'
      script.async = true
      script.src = src
      const firstScript = d.getElementsByTagName('script')[0]
      firstScript?.parentNode?.insertBefore(script, firstScript)
    }

    ttq.load(process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID)
    ttq.page()
  })(window, document, 'ttq')
}

