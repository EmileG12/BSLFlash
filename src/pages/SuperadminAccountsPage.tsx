import { useState } from 'react'
import { Ban } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableCard } from '../components/TableCard'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useUsersWithRoles, type UserWithRoles } from '../hooks/useUsersWithRoles'
import { supabase } from '../lib/supabase'
import { isBanned } from '../lib/userStatus'

export function SuperadminAccountsPage() {
  const { users, loading, error, setUsers } = useUsersWithRoles()
  const [search, setSearch] = useState('')
  const [banTarget, setBanTarget] = useState<UserWithRoles | null>(null)
  const [banning, setBanning] = useState(false)
  const [banError, setBanError] = useState<string | null>(null)
  const [unbanningUserId, setUnbanningUserId] = useState<string | null>(null)
  const [unbanError, setUnbanError] = useState<string | null>(null)

  const filtered = users.filter((user) => {
    const haystack = `${user.email ?? ''} ${user.user_name ?? ''}`.toLowerCase()
    return haystack.includes(search.trim().toLowerCase())
  })

  async function handleBanConfirm() {
    if (!banTarget) return
    setBanning(true)
    setBanError(null)
    const { error } = await supabase.rpc('ban_user', { p_user_id: banTarget.user_id })
    setBanning(false)
    if (error) {
      setBanError(error.message)
      return
    }
    setUsers((previous) =>
      previous.map((item) =>
        item.user_id === banTarget.user_id ? { ...item, banned_until: 'infinity' } : item,
      ),
    )
    setBanTarget(null)
  }

  async function handleUnban(user: UserWithRoles) {
    setUnbanningUserId(user.user_id)
    setUnbanError(null)
    const { error } = await supabase.rpc('unban_user', { p_user_id: user.user_id })
    setUnbanningUserId(null)
    if (error) {
      setUnbanError(error.message)
      return
    }
    setUsers((previous) =>
      previous.map((item) => (item.user_id === user.user_id ? { ...item, banned_until: null } : item)),
    )
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4">
      <h1>Manage Accounts</h1>

      {unbanError && (
        <p role="alert" className="text-sm text-destructive">
          {unbanError}
        </p>
      )}

      <TableCard
        toolbar={
          <Input
            placeholder="Search by email or name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full sm:max-w-xs"
          />
        }
      >
        {loading && <p className="px-4 py-6 text-sm text-muted-foreground">Loading users…</p>}
        {error && (
          <p role="alert" className="px-4 py-6 text-sm text-destructive">
            {error}
          </p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <p className="px-4 py-6 text-sm text-muted-foreground">No users match.</p>
        )}
        {!loading && !error && filtered.length > 0 && (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => {
                const banned = isBanned(user)
                return (
                  <TableRow key={user.user_id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.user_name ?? '—'}</TableCell>
                    <TableCell>
                      {banned ? (
                        <Badge className="bg-warning text-warning-foreground">Banned</Badge>
                      ) : (
                        <Badge variant="secondary">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {banned ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnban(user)}
                          disabled={unbanningUserId === user.user_id}
                        >
                          {unbanningUserId === user.user_id ? 'Unbanning…' : 'Unban'}
                        </Button>
                      ) : (
                        <Button size="sm" variant="destructive" onClick={() => setBanTarget(user)}>
                          <Ban aria-hidden="true" className="size-3.5" />
                          Ban
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </TableCard>

      <Dialog open={banTarget !== null} onOpenChange={(open) => !open && setBanTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban {banTarget?.email}?</DialogTitle>
            <DialogDescription>
              They'll be signed out and unable to sign back in until unbanned. Their data is kept.
            </DialogDescription>
          </DialogHeader>
          {banError && (
            <p role="alert" className="text-sm text-destructive">
              {banError}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanTarget(null)} disabled={banning}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBanConfirm} disabled={banning}>
              {banning ? 'Banning…' : 'Ban'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
