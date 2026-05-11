'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface UserDetailsModalProps {
  open: boolean
  user?: {
    name: string
    username: string
    email?: string
    avatar?: string | null
    timezone?: string
  }
  role?: 'owner' | 'admin' | 'member'
  onOpenChange: (open: boolean) => void
}

export function UserDetailsModal({ open, user, role, onOpenChange }: UserDetailsModalProps) {
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
    : '?'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User details</DialogTitle>
          <DialogDescription>Profile information for this member.</DialogDescription>
        </DialogHeader>

        {user ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
                <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-base font-semibold truncate">{user.name}</p>
                <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                {role ? <Badge className="mt-2" variant="outline">{role}</Badge> : null}
              </div>
            </div>

            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Email</span>
                <span className="truncate text-right">{user.email || 'Not available'}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Timezone</span>
                <span className="truncate text-right">{user.timezone || 'Unknown'}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">User details are not available.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
