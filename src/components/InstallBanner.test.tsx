import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { InstallBanner } from './InstallBanner'

vi.mock('../hooks/useInstallPrompt', () => ({
  useInstallPrompt: vi.fn(),
}))

function mockInstallPrompt(overrides: Partial<ReturnType<typeof useInstallPrompt>>) {
  vi.mocked(useInstallPrompt).mockReturnValue({
    canInstall: true,
    canPromptNatively: true,
    platform: 'other',
    dismissed: false,
    promptInstall: vi.fn(),
    dismiss: vi.fn(),
    ...overrides,
  })
}

describe('InstallBanner', () => {
  beforeEach(() => {
    mockInstallPrompt({})
  })

  it('renders nothing when the app is not installable', () => {
    mockInstallPrompt({ canInstall: false })

    render(<InstallBanner />)

    expect(screen.queryByText(/install bsl flash/i)).not.toBeInTheDocument()
  })

  it('renders nothing once dismissed', () => {
    mockInstallPrompt({ dismissed: true })

    render(<InstallBanner />)

    expect(screen.queryByText(/install bsl flash/i)).not.toBeInTheDocument()
  })

  it('triggers the native prompt directly when one is available', async () => {
    const promptInstall = vi.fn()
    mockInstallPrompt({ canPromptNatively: true, promptInstall })
    const user = userEvent.setup()

    render(<InstallBanner />)
    await user.click(screen.getByText(/install bsl flash/i))

    expect(promptInstall).toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows manual instructions instead when there is no native prompt', async () => {
    mockInstallPrompt({ canPromptNatively: false, platform: 'ios' })
    const user = userEvent.setup()

    render(<InstallBanner />)
    await user.click(screen.getByText(/install bsl flash/i))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/add to home screen/i)).toBeInTheDocument()
  })

  it('calls dismiss when the close button is clicked', async () => {
    const dismiss = vi.fn()
    mockInstallPrompt({ dismiss })
    const user = userEvent.setup()

    render(<InstallBanner />)
    await user.click(screen.getByRole('button', { name: /dismiss/i }))

    expect(dismiss).toHaveBeenCalled()
  })
})
