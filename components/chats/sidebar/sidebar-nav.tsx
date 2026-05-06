"use client"

import { MessageSquare, Users, MailQuestion, UserPlus, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface SidebarNavProps {
  isDirectActive: boolean
  isGroupActive: boolean
  isRequestsActive: boolean
  isFindUsersActive: boolean
  isSettingsActive: boolean
  onNavigate: (path: string) => void
  user: { name?: string | null; username?: string | null; avatar?: string | null } | null
}

const buttonClass = (isActive: boolean) =>
  cn(
    "h-14 w-14 flex items-center justify-center m-0.5 rounded-xl transition-colors bg-transparent",
    isActive
      ? "border border-blue-500/40 bg-blue-500/20 text-foreground hover:bg-blue-500/20"
      : "text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all",
  )

const getInitials = (name?: string | null, username?: string | null) => {
  const source = name?.trim() || username?.trim() || ""
  if (!source) return "ME"
  const parts = source.split(" ").filter(Boolean)
  const initials = parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0]
  return initials.toUpperCase()
}

export function SidebarNav({
  isDirectActive,
  isGroupActive,
  isRequestsActive,
  isFindUsersActive,
  isSettingsActive,
  onNavigate,
  user,
}: SidebarNavProps) {
  const initials = getInitials(user?.name, user?.username)

  return (
    <div className="mx-1 w-16 shrink-0 border-r border-border/60 bg-background/70 backdrop-blur-sm flex flex-col py-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            className={buttonClass(isDirectActive)}
            aria-label="Direct chats"
            onClick={() => onNavigate("/chats")}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Direct chats</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            className={buttonClass(isGroupActive)}
            aria-label="Group chats"
            onClick={() => onNavigate("/chats/groups")}
          >
            <Users className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Group chats</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            className={buttonClass(isRequestsActive)}
            aria-label="Requests"
            onClick={() => onNavigate("/chats/requests")}
          >
            <MailQuestion className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Requests</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            className={buttonClass(isFindUsersActive)}
            aria-label="Add friend"
            onClick={() => onNavigate("/find-users")}
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Find users</TooltipContent>
      </Tooltip>
      <div className="flex-1" />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            className={buttonClass(isSettingsActive)}
            aria-label="Settings"
            onClick={() => onNavigate("/settings")}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Settings</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            className={cn(
              "mt-2 h-12 w-12 rounded-full bg-transparent p-0 text-foreground hover:bg-accent/50 mx-1",
              "border border-transparent hover:border-border",
            )}
            aria-label="Profile"
            onClick={() => onNavigate("/profile")}
          >
            <Avatar className="h-10 w-10">
              {user?.avatar ? <AvatarImage src={user.avatar} alt={user.name || "Profile"} /> : null}
              <AvatarFallback className="bg-secondary text-secondary-foreground">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Profile</TooltipContent>
      </Tooltip>
    </div>
  )
}
