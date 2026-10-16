import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { renderWithQueryClient } from '../test/renderWithQueryClient'
import { SuperadminAccountsPage } from './SuperadminAccountsPage'

vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}))

const users = [
  { user_id: 'user-1', email: 'active@example.com', user_name: 'Active User', banned_until: null, roles: ['user'] },
  {
    user_id: 'user-2',
    email: 'banned@example.com',
    user_name: 'Banned User',
    banned_until: 'infinity',
    roles: ['user'],
  },
]

function mockBackend() {
  vi.mocked(supabase.rpc).mockImplementation((fn: string) => {
    if (fn === 'list_users_with_roles') {
      return Promise.resolve({ data: users, error: null }) as never
    }
    return Promise.resolve({ data: null, error: null }) as never
  })
}

describe('SuperadminAccountsPage', () => {
  it('lists users with their status and the right actions per status', async () => {
    mockBackend()

    renderWithQueryClient(<SuperadminAccountsPage />)

    const activeRow = (await screen.findByText('active@example.com')).closest('tr')!
    expect(within(activeRow).getByText('Active')).toBeInTheDocument()
    expect(within(activeRow).getByRole('button', { name: 'Ban' })).toBeInTheDocument()
    expect(within(activeRow).getByRole('button', { name: 'Delete' })).toBeInTheDocument()

    const bannedRow = screen.getByText('banned@example.com').closest('tr')!
    expect(within(bannedRow).getByText('Banned')).toBeInTheDocument()
    expect(within(bannedRow).getByRole('button', { name: 'Unban' })).toBeInTheDocument()
    expect(within(bannedRow).getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('cancelling the delete dialog leaves the account untouched', async () => {
    mockBackend()
    const user = userEvent.setup()

    renderWithQueryClient(<SuperadminAccountsPage />)
    await screen.findByText('active@example.com')

    const activeRow = screen.getByText('active@example.com').closest('tr')!
    await user.click(within(activeRow).getByRole('button', { name: 'Delete' }))

    expect(screen.getByRole('heading', { name: 'Permanently delete active@example.com?' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('heading', { name: /permanently delete/i })).not.toBeInTheDocument()
    expect(supabase.rpc).not.toHaveBeenCalledWith('delete_user', expect.anything())
    expect(screen.getByText('active@example.com')).toBeInTheDocument()
  })

  it('confirming delete calls delete_user and removes the account from the list', async () => {
    mockBackend()
    const user = userEvent.setup()

    renderWithQueryClient(<SuperadminAccountsPage />)
    await screen.findByText('active@example.com')

    const activeRow = screen.getByText('active@example.com').closest('tr')!
    await user.click(within(activeRow).getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Delete permanently' }))

    await waitFor(() =>
      expect(supabase.rpc).toHaveBeenCalledWith('delete_user', { p_user_id: 'user-1' }),
    )
    expect(screen.queryByText('active@example.com')).not.toBeInTheDocument()
    expect(screen.getByText('banned@example.com')).toBeInTheDocument()
  })

  it('shows the error and keeps the account when delete_user fails (e.g. last remaining superadmin)', async () => {
    vi.mocked(supabase.rpc).mockImplementation((fn: string) => {
      if (fn === 'list_users_with_roles') {
        return Promise.resolve({ data: users, error: null }) as never
      }
      if (fn === 'delete_user') {
        return Promise.resolve({
          data: null,
          error: { message: 'Cannot delete the last remaining active superadmin' },
        }) as never
      }
      return Promise.resolve({ data: null, error: null }) as never
    })
    const user = userEvent.setup()

    renderWithQueryClient(<SuperadminAccountsPage />)
    await screen.findByText('active@example.com')

    const activeRow = screen.getByText('active@example.com').closest('tr')!
    await user.click(within(activeRow).getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Delete permanently' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Cannot delete the last remaining active superadmin',
    )
    expect(screen.getByText('active@example.com')).toBeInTheDocument()
  })

  it('confirming ban calls ban_user and flips the account to Banned', async () => {
    mockBackend()
    const user = userEvent.setup()

    renderWithQueryClient(<SuperadminAccountsPage />)
    await screen.findByText('active@example.com')

    const activeRow = screen.getByText('active@example.com').closest('tr')!
    await user.click(within(activeRow).getByRole('button', { name: 'Ban' }))

    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Ban' }))

    await waitFor(() => expect(supabase.rpc).toHaveBeenCalledWith('ban_user', { p_user_id: 'user-1' }))
    const row = screen.getByText('active@example.com').closest('tr')!
    expect(within(row).getByText('Banned')).toBeInTheDocument()
    expect(within(row).getByRole('button', { name: 'Unban' })).toBeInTheDocument()
  })
})
