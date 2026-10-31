import { useEffect, useState } from 'react'

const DISMISSED_KEY = 'bslflash-install-dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallPlatform = 'ios' | 'android' | 'other'

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function detectPlatform(): InstallPlatform {
  const ua = navigator.userAgent
  const isIos = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
  if (isIos) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'other'
}

// `beforeinstallprompt` fires once, early, and only to listeners already
// attached at that moment -- it is never redispatched. Two independent
// per-component listeners (e.g. one in the always-mounted InstallBanner, one
// in MobileNavSheet's install row that only mounts once the sheet is opened)
// would see different things depending on mount order. Capturing it in this
// module-level singleton, attached as soon as this module is first imported,
// and fanning it out to every hook instance via a subscriber list keeps all
// consumers in sync regardless of when each one mounts.
let deferredEvent: BeforeInstallPromptEvent | null = null
const subscribers = new Set<() => void>()

function notify() {
  for (const subscriber of subscribers) subscriber()
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault()
  deferredEvent = event as BeforeInstallPromptEvent
  notify()
})

window.addEventListener('appinstalled', () => {
  deferredEvent = null
  notify()
})

/**
 * Tracks installability of the app as a PWA: captures the `beforeinstallprompt`
 * event (Chromium/Android) for a real one-tap install, exposes the platform so
 * callers can show manual "Add to Home Screen" instructions where no native
 * prompt exists (iOS Safari, Firefox Android — anything that never fires the
 * event), and hides everything once the app is already running standalone.
 */
export function useInstallPrompt() {
  const [, forceUpdate] = useState(0)
  const [standalone, setStandalone] = useState(isStandalone)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === 'true')

  useEffect(() => {
    function handleChange() {
      forceUpdate((value) => value + 1)
      setStandalone(isStandalone())
    }

    subscribers.add(handleChange)
    return () => {
      subscribers.delete(handleChange)
    }
  }, [])

  async function promptInstall() {
    if (!deferredEvent) return
    await deferredEvent.prompt()
    const { outcome } = await deferredEvent.userChoice
    if (outcome === 'accepted') {
      deferredEvent = null
      notify()
    }
  }

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, 'true')
    setDismissed(true)
  }

  const platform = detectPlatform()
  const canPromptNatively = deferredEvent !== null
  // Not installable on desktop browsers that never offer the native prompt
  // either; mobile-only gating (viewport) is left to the caller, matching how
  // NavBar/MobileNavSheet already split mobile vs desktop.
  const canInstall = !standalone && (canPromptNatively || platform === 'ios' || platform === 'android')

  return {
    canInstall,
    canPromptNatively,
    platform,
    dismissed,
    promptInstall,
    dismiss,
  }
}
