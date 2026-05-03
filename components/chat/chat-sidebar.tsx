"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  view?: "messages" | "requests"
  chatType?: "direct" | "group"
}

export function ChatSidebar({
  chats,
  activeChat,
  onSelectChat,
  isOpen,
  onToggle,
  view = "messages",
  chatType = "direct",
}: ChatSidebarProps) {
  const dispatch = useAppDispatch()
  const { userPresence } = useAppSelector((state) => state.chat)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      chat.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.participantUsername.toLowerCase().includes(searchQuery.toLowerCase())

    const isRequest = (chat as Chat & { isRequest?: boolean }).isRequest || false
    if (view === "requests") return isRequest && matchesSearch
    if (isRequest) return false

    if (chatType === "direct") return matchesSearch
    return matchesSearch
  })

  const handleSelectChat = (chat: Chat) => {
    onSelectChat(chat)
    if (chat.messages.length > 0) {
      dispatch(unlockMessage(chat.messages[chat.messages.length - 1].id))
    }
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
          isOpen ? "left-76.25" : "left-2.5",
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
              "absolute md:relative z-10 h-full",
              activeChat && "hidden md:flex",
            )}
          >
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">{view === "requests" ? "Requests" : "Chats"}</h2>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={view === "messages" ? "Search conversations..." : "Search requests..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>

            <div className="flex-1 relative overflow-hidden">
              {filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                  <p>{view === "requests" ? "No message requests" : "No conversations yet"}</p>
                </div>
              ) : (
                <div className="h-full overflow-y-auto">
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
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
