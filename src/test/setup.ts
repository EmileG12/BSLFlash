import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Without `globals: true` in the Vitest config, React Testing Library can't
// detect a global `afterEach` to hook its automatic per-test DOM cleanup
// into, so each test's render would stay mounted for the next one. Wiring
// it explicitly here keeps that behavior without turning on implicit globals.
afterEach(cleanup)
