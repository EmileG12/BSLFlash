import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { useInstallPrompt as useInstallPromptType } from './useInstallPrompt'

const DISMISSED_KEY = 'bslflash-install-dismissed'

function setUserAgent(userAgent: string) {
  Object.defineProperty(window.navigator, 'userAgent', { value: userAgent, configurable: true })
}

function mockMatchMedia(matches: boolean) {
  vi.spyOn(window, 'matchMedia').mockReturnValue({
    matches,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  } as unknown as MediaQueryList)
}

// The hook keeps its captured `beforeinstallprompt` event in a module-level
// singleton (so every component using the hook sees the same event,
// regardless of mount order -- see the comment in useInstallPrompt.ts). That
// means each test needs its own fresh module instance, or state would leak
// between tests in this file.
async function freshUseInstallPrompt(): Promise<typeof useInstallPromptType> {
  vi.resetModules()
  const mod = await import('./useInstallPrompt')
  return mod.useInstallPrompt
}

describe('useInstallPrompt', () => {
  beforeEach(() => {
    localStorage.removeItem(DISMISSED_KEY)
    mockMatchMedia(false)
    setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reports not installable on a desktop browser with no native prompt offered', async () => {
    const useInstallPrompt = await freshUseInstallPrompt()
    const { result } = renderHook(() => useInstallPrompt())

    expect(result.current.canInstall).toBe(false)
    expect(result.current.canPromptNatively).toBe(false)
  })

  it('becomes installable once beforeinstallprompt fires, and can trigger the native prompt', async () => {
    const useInstallPrompt = await freshUseInstallPrompt()
    const { result } = renderHook(() => useInstallPrompt())

    const userChoice = Promise.resolve({ outcome: 'accepted' as const })
    const promptEvent = Object.assign(new Event('beforeinstallprompt'), {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice,
    })

    act(() => {
      window.dispatchEvent(promptEvent)
    })

    expect(result.current.canInstall).toBe(true)
    expect(result.current.canPromptNatively).toBe(true)

    await act(async () => {
      await result.current.promptInstall()
    })

    expect(promptEvent.prompt).toHaveBeenCalled()
    expect(result.current.canPromptNatively).toBe(false)
  })

  it('shares the captured prompt event across independently mounted hook instances', async () => {
    const useInstallPrompt = await freshUseInstallPrompt()
    const first = renderHook(() => useInstallPrompt())

    const promptEvent = Object.assign(new Event('beforeinstallprompt'), {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    })

    act(() => {
      window.dispatchEvent(promptEvent)
    })

    expect(first.result.current.canPromptNatively).toBe(true)

    // Simulates MobileNavSheet's install row: a second hook instance that
    // mounts later, after the event already fired.
    const second = renderHook(() => useInstallPrompt())

    expect(second.result.current.canPromptNatively).toBe(true)
  })

  it('treats appinstalled as standalone and clears installability', async () => {
    const useInstallPrompt = await freshUseInstallPrompt()
    const { result } = renderHook(() => useInstallPrompt())

    act(() => {
      window.dispatchEvent(new Event('appinstalled'))
    })

    expect(result.current.canInstall).toBe(false)
  })

  it('is installable on iOS even without a native prompt event, via manual instructions', async () => {
    setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15')
    const useInstallPrompt = await freshUseInstallPrompt()

    const { result } = renderHook(() => useInstallPrompt())

    expect(result.current.platform).toBe('ios')
    expect(result.current.canPromptNatively).toBe(false)
    expect(result.current.canInstall).toBe(true)
  })

  it('is not installable when already running standalone', async () => {
    mockMatchMedia(true)
    setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15')
    const useInstallPrompt = await freshUseInstallPrompt()

    const { result } = renderHook(() => useInstallPrompt())

    expect(result.current.canInstall).toBe(false)
  })

  it('persists dismissal to localStorage and reflects it immediately', async () => {
    const useInstallPrompt = await freshUseInstallPrompt()
    const { result } = renderHook(() => useInstallPrompt())

    expect(result.current.dismissed).toBe(false)

    act(() => {
      result.current.dismiss()
    })

    expect(result.current.dismissed).toBe(true)
    expect(localStorage.getItem(DISMISSED_KEY)).toBe('true')
  })
})
