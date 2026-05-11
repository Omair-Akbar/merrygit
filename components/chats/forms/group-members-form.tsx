"use client"

import { KeyboardEvent, useMemo } from "react"
import { Search, UserPlus, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { UserProfile } from "@/lib/store/slices/user-slice"

interface GroupMembersFormProps {
  memberSearchQuery: string
  memberSearchType: "email" | "username"
  hasMemberSearch: boolean
  isSearching: boolean
  searchError: string | null
  searchResults: UserProfile[]
  isInviting: boolean
  isLoading: boolean
  invitedMembersCount: number
  onSearchQueryChange: (query: string) => void
  onSearchTypeChange: (type: "email" | "username") => void
  onSearch: () => void
  onSearchKeyPress: (e: KeyboardEvent<HTMLInputElement>) => void
  onInviteMember: (profile: UserProfile) => void
  onBack: () => void
  onFinish: () => void
  onCancel: () => void
}

export function GroupMembersForm({
  memberSearchQuery,
  memberSearchType,
  hasMemberSearch,
  isSearching,
  searchError,
  searchResults,
  isInviting,
  isLoading,
  invitedMembersCount,
  onSearchQueryChange,
  onSearchTypeChange,
  onSearch,
  onSearchKeyPress,
  onInviteMember,
  onBack,
  onFinish,
  onCancel,
}: GroupMembersFormProps) {
  const exactMatches = useMemo(() => {
    const query = memberSearchQuery.trim().toLowerCase()
    if (!query) return []

    return searchResults.filter((result) => {
      const target = memberSearchType === "email" ? result.email : result.username
      return target?.toLowerCase() === query
    })
  }, [memberSearchQuery, memberSearchType, searchResults])

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-6 py-6 space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Invite members</h2>
            <p className="text-sm text-muted-foreground">Search and add members to your group.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel} className="gap-2">
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={memberSearchType === "username" ? "default" : "outline"}
              onClick={() => onSearchTypeChange("username")}
              className={`flex-1 ${memberSearchType === "username" && "dark:bg-white"}`}
              disabled={isLoading}
            >
              By Username
            </Button>
            <Button
              variant={memberSearchType === "email" ? "default" : "outline"}
              onClick={() => onSearchTypeChange("email")}
              className={`flex-1 ${memberSearchType === "email" && "dark:bg-white"}`}
              disabled={isLoading}
            >
              By Email
            </Button>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={
                  memberSearchType === "email" ? "Enter exact email address..." : "Enter exact username..."
                }
                value={memberSearchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                onKeyPress={onSearchKeyPress}
                className="pl-9"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={onSearch}
              disabled={memberSearchQuery.trim().length === 0 || isLoading}
              className="dark:bg-white"
            >
              Search
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {!hasMemberSearch ? (
            <p className="text-sm text-muted-foreground">Enter an exact {memberSearchType} to find a user.</p>
          ) : isSearching ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </div>
          ) : searchError ? (
            <p className="text-sm text-destructive">{searchError}</p>
          ) : exactMatches.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No exact match found. Please check the {memberSearchType}.
            </p>
          ) : (
            <div className="space-y-2">
              {exactMatches.map((user) => (
                <div key={user.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <Avatar className="h-10 w-10">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
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
                    onClick={() => onInviteMember(user)}
                    disabled={isInviting}
                    className="gap-2 whitespace-nowrap"
                  >
                    <UserPlus className="h-4 w-4" />
                    Invite
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
          <div>
            <p className="text-sm font-medium">Members invited</p>
            <p className="text-xs text-muted-foreground">{invitedMembersCount} total</p>
          </div>
          <Badge>{invitedMembersCount}</Badge>
        </div>

        <div className="flex justify-between gap-2">
          <Button variant="secondary" onClick={onBack} disabled={isLoading}>
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onFinish} disabled={isLoading}>
              Skip members
            </Button>
            <Button
              onClick={onFinish}
              disabled={isLoading}
              className="gap-2 dark:bg-white"
            >
              Finish
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
