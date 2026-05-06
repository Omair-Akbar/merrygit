"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SidebarHeaderProps {
  view: "messages" | "requests"
  searchQuery: string
  onSearchChange: (value: string) => void
}

export function SidebarHeader({ view, searchQuery, onSearchChange }: SidebarHeaderProps) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">{view === "requests" ? "Requests" : "Chats"}</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={view === "messages" ? "Search conversations..." : "Search requests..."}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9"
        />
      </div>
    </div>
  )
}
