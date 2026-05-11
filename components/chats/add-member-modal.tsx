'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, UserPlus, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { searchUserThunk, clearSearch, type UserProfile } from '@/lib/store/slices/user-slice'
import { inviteGroupMemberThunk } from '@/lib/store/slices/group-slice'
import { toast } from 'react-hot-toast'

interface AddMemberModalProps {
  open: boolean
  groupId: string
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddMemberModal({ open, groupId, onOpenChange, onSuccess }: AddMemberModalProps) {
  const dispatch = useAppDispatch()
  const { searchResults, isSearching, searchError } = useAppSelector((state) => state.user)
  const { isLoadingInviteMember } = useAppSelector((state) => state.group)
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState<'email' | 'username'>('username')

  useEffect(() => {
    if (!open) {
      setQuery('')
      setSearchType('username')
      dispatch(clearSearch())
    }
  }, [open, dispatch])

  const exactMatches = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return []

    return searchResults.filter((result) => {
      const target = searchType === 'email' ? result.email : result.username
      return target?.toLowerCase() === value
    })
  }, [query, searchResults, searchType])

  const handleSearch = () => {
    const trimmed = query.trim()
    if (!trimmed) return
    dispatch(searchUserThunk({ query: trimmed, type: searchType }))
  }

  const handleInvite = async (profile: UserProfile) => {
    try {
      await dispatch(inviteGroupMemberThunk({ groupId, memberId: profile.id })).unwrap()
      toast.success(`${profile.name} invited successfully`)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to invite member')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add member</DialogTitle>
          <DialogDescription>Search by username or email and invite a member.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={searchType === 'username' ? 'default' : 'outline'}
              onClick={() => setSearchType('username')}
              className={searchType === 'username' ? 'dark:bg-white' : ''}
            >
              By Username
            </Button>
            <Button
              type="button"
              variant={searchType === 'email' ? 'default' : 'outline'}
              onClick={() => setSearchType('email')}
              className={searchType === 'email' ? 'dark:bg-white' : ''}
            >
              By Email
            </Button>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchType === 'email' ? 'Enter exact email...' : 'Enter exact username...'}
                className="pl-9"
              />
            </div>
            <Button
              type="button"
              onClick={handleSearch}
              disabled={!query.trim() || isSearching}
              className="dark:bg-white"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
            </Button>
          </div>

          {searchError ? <p className="text-sm text-destructive">{searchError}</p> : null}
{/* 
          {query.trim().length > 0 && !isSearching && exactMatches.length === 0 && !searchError ? (
            <p className="text-sm text-muted-foreground">No exact match found.</p>
          ) : null} */}

          {exactMatches.length > 0 ? (
            <div className="space-y-2">
              {exactMatches.map((user) => (
                <div key={user.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <Avatar className="h-10 w-10">
                    {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleInvite(user)}
                    disabled={isLoadingInviteMember}
                    className="gap-2 whitespace-nowrap"
                  >
                    <UserPlus className="h-4 w-4" />
                    Invite
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
