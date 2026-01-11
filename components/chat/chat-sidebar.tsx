"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronLeft, ChevronRight, Settings } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserStatusIndicator } from "@/components/chat/user-status-indicator"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { unlockMessage, type Chat } from "@/lib/store/slices/chat-slice"
import { cn } from "@/lib/utils"

interface ChatSidebarProps {
  chats: Chat[]
  activeChat: Chat | null
  onSelectChat: (chat: Chat) => void
  isOpen: boolean
  onToggle: () => void
}

export function ChatSidebar({ chats, activeChat, onSelectChat, isOpen, onToggle }: ChatSidebarProps) {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { userPresence } = useAppSelector((state) => state.chat)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredChats = chats.filter(
    (chat) =>
      chat.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.participantUsername.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSelectChat = (chat: Chat) => {
    onSelectChat(chat)
    if (chat.messages.length > 0) {
      dispatch(unlockMessage(chat.messages[chat.messages.length - 1].id))
    }
  }

  const currentUser = user || {
    name: "Demo User",
    username: "demouser",
    avatar: undefined,
  }

  const getPresence = (userId: string) => {
    return userPresence[userId] || { isOnline: false, isViewing: false }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className={cn(
          "absolute top-20 z-20 h-8 w-8 rounded-full border border-border bg-background shadow-sm transition-all hidden md:flex",
          isOpen ? "left-[304px]" : "left-2",
        )}
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "border-r border-border flex flex-col bg-background overflow-hidden",
              "absolute md:relative z-10 h-[calc(100vh-3.5rem)]",
              activeChat && "hidden md:flex",
            )}
          >
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredChats.map((chat) => {
                const presence = getPresence(chat.participantId)
                const isOnline = presence.isOnline || chat.isOnline || false
                const isViewing = presence.isViewing || chat.isViewing || false

                return (
                  <motion.button
                    key={chat.id}
                    onClick={() => handleSelectChat(chat)}
                    whileHover={{ backgroundColor: "var(--color-accent)" }}
                    className={cn(
                      "w-full p-4 flex items-center gap-3 border-b border-border/50 transition-colors text-left",
                      activeChat?.id === chat.id && "bg-accent",
                    )}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          {chat.participantName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{chat.participantName}</p>
                        <span className="text-xs text-muted-foreground">
                          {chat.messages[chat.messages.length - 1]?.timestamp}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground truncate">@{chat.participantUsername}</p>
                        <UserStatusIndicator
                          isOnline={isOnline}
                          isViewing={isViewing}
                          showViewingStatus={true}
                          size="sm"
                        />
                      </div>
                    </div>
                    {chat.unreadCount > 0 && (
                      <span className="h-5 min-w-5 px-1.5 rounded-full bg-foreground text-background text-xs flex items-center justify-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </motion.button>
                )
              })}
            </div>

            <div className="border-t border-border">
              <div className="p-4 pb-2">
                <Button className="w-full bg-secondary text-secondary-foreground hover:bg-accent" asChild>
                  <Link href="/find-users">Find Users</Link>
                </Button>
              </div>

              <div className="p-4 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Avatar className="h-10 w-10">
                    {currentUser.avatar && (
                      <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                    )}
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {currentUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{currentUser.username}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link href="/settings">
                      <Settings className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
