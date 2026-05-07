"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SidebarHeaderProps {
  view: "messages" | "requests"
  chatType?: "direct" | "group"
  searchQuery: string
  onSearchChange: (value: string) => void
}

export function SidebarHeader({ view, chatType = "direct", searchQuery, onSearchChange }: SidebarHeaderProps) {
  const title = view === "requests" ? "Requests" : chatType === "group" ? "Group Chat" : "Chats"
  const placeholder =
    view === "messages"
      ? chatType === "group"
        ? "Search group chats..."
        : "Search conversations..."
      : "Search requests..."

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9"
        />
      </div>
    </div>
  )
}
