"use client"

import { memo } from "react"
import { Logo } from "@/components/ui/logo"
import { ThemeToggle } from "@/components/ui/theme-toggle"

function ChatHeaderComponent() {
  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Logo size={28} />
        <span className="font-semibold hidden sm:inline font-exo">MerryGit</span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  )
}

export const ChatHeader = memo(ChatHeaderComponent)
