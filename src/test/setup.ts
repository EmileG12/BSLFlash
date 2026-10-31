import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Without `globals: true` in the Vitest config, React Testing Library can't
// detect a global `afterEach` to hook its automatic per-test DOM cleanup
// into, so each test's render would stay mounted for the next one. Wiring
// it explicitly here keeps that behavior without turning on implicit globals.
afterEach(cleanup)

// jsdom doesn't implement ResizeObserver (it has no real layout engine to
// observe), but Radix UI components (e.g. Tooltip's size-tracking Arrow)
// call it unconditionally. A no-op stub is enough since nothing in these
// tests depends on actual resize measurements.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver

// jsdom doesn't implement matchMedia (it has no real viewport/media-query
// engine), but useInstallPrompt calls it unconditionally to detect standalone
// display mode. A stub that always reports "no match" is enough since no test
// here depends on a real media query evaluating true.
window.matchMedia ??=
  (() => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
