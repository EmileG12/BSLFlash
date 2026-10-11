import { useState } from 'react'
import { Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

type AssignableRole = 'admin' | 'superadmin'

function isAssignableRole(role: string): role is AssignableRole {
  return role === 'admin' || role === 'superadmin'
}

export function SuperadminRolesPage() {
  const { users, loading, error, setUsers } = useUsersWithRoles()
  const [search, setSearch] = useState('')
  const [grantRole, setGrantRole] = useState<Record<string, AssignableRole>>({})
  const [grantingUserId, setGrantingUserId] = useState<string | null>(null)
  const [grantError, setGrantError] = useState<string | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<{ user: UserWithRoles; role: AssignableRole } | null>(
    null,
  )
  const [revoking, setRevoking] = useState(false)
  const [revokeError, setRevokeError] = useState<string | null>(null)

  const filtered = users.filter((user) => {
    const haystack = `${user.email ?? ''} ${user.user_name ?? ''}`.toLowerCase()
    return haystack.includes(search.trim().toLowerCase())
  })

  async function handleGrant(user: UserWithRoles) {
    const role = grantRole[user.user_id] ?? 'admin'
    if (user.roles.includes(role)) return
    setGrantingUserId(user.user_id)
    setGrantError(null)
    const { error } = await supabase.rpc('assign_role', { p_user_id: user.user_id, p_role_name: role })
    setGrantingUserId(null)
    if (error) {
      setGrantError(error.message)
      return
    }
    setUsers((previous) =>
      previous.map((item) =>
        item.user_id === user.user_id ? { ...item, roles: [...item.roles, role] } : item,
      ),
    )
  }

  async function handleRevokeConfirm() {
    if (!revokeTarget) return
    setRevoking(true)
    setRevokeError(null)
    const { error } = await supabase.rpc('revoke_role', {
      p_user_id: revokeTarget.user.user_id,
      p_role_name: revokeTarget.role,
    })
    setRevoking(false)
    if (error) {
      setRevokeError(error.message)
      return
    }
    setUsers((previous) =>
      previous.map((item) =>
        item.user_id === revokeTarget.user.user_id
          ? { ...item, roles: item.roles.filter((role) => role !== revokeTarget.role) }
          : item,
      ),
    )
    setRevokeTarget(null)
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4">
      <h1>Manage Roles</h1>

      {grantError && (
        <p role="alert" className="text-sm text-destructive">
          {grantError}
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
                <TableHead>Roles</TableHead>
                <TableHead>Grant role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => {
                const assignedRoles = user.roles.filter(isAssignableRole)
                return (
                  <TableRow key={user.user_id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.user_name ?? '—'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {assignedRoles.length === 0 && (
                          <span className="text-sm text-muted-foreground">No roles</span>
                        )}
                        {assignedRoles.map((role) => (
                          <Badge
                            key={role}
                            variant="secondary"
                            className={role === 'superadmin' ? 'bg-warning text-warning-foreground' : undefined}
                          >
                            {role === 'superadmin' && <Shield aria-hidden="true" className="size-3" />}
                            {role === 'superadmin' ? 'Superadmin' : 'Admin'}
                            <button
                              type="button"
                              className="ml-1 underline"
                              onClick={() => setRevokeTarget({ user, role })}
                            >
                              Revoke
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={grantRole[user.user_id] ?? 'admin'}
                          onValueChange={(value) =>
                            setGrantRole((previous) => ({
                              ...previous,
                              [user.user_id]: value as AssignableRole,
                            }))
                          }
                        >
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="superadmin">Superadmin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={() => handleGrant(user)}
                          disabled={grantingUserId === user.user_id}
                        >
                          Grant
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </TableCard>

      <Dialog open={revokeTarget !== null} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Revoke {revokeTarget?.role === 'superadmin' ? 'superadmin' : 'admin'} from{' '}
              {revokeTarget?.user.email}?
            </DialogTitle>
            <DialogDescription>
              They will immediately lose access to the pages this role grants.
            </DialogDescription>
          </DialogHeader>
          {revokeError && (
            <p role="alert" className="text-sm text-destructive">
              {revokeError}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeTarget(null)} disabled={revoking}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRevokeConfirm} disabled={revoking}>
              {revoking ? 'Revoking…' : 'Revoke'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
