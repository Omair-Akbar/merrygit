"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserStatusIndicator } from "@/components/chats/user-status-indicator"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { Chat, UserPresence } from "@/lib/store/slices/chat-slice"

interface SidebarChatListProps {
  chats: Chat[]
  activeChatId: string | null
  onSelectChat: (chat: Chat) => void
  userPresence: Record<string, UserPresence>
  view: "messages" | "requests"
  isLoading?: boolean
}

const getPresence = (userPresence: Record<string, UserPresence>, userId: string) => {
  return userPresence[userId] || { isOnline: false, isViewing: false }
}

export function SidebarChatList({
  chats,
  activeChatId,
  onSelectChat,
  userPresence,
  view,
  isLoading = false,
}: SidebarChatListProps) {
  if (isLoading && chats.length === 0) {
    return (
      <div className="h-full overflow-y-auto p-4 space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={`chat-skel-${index}`} className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
        <p>{view === "requests" ? "No message requests" : "No conversations yet"}</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      {chats.map((chat) => {
        const presence = getPresence(userPresence, chat.participantId)
        const isOnline = presence.isOnline || chat.isOnline || false
        const isViewing = presence.isViewing || chat.isViewing || false

        return (
          <motion.button
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            whileHover={{ backgroundColor: "var(--color-accent)" }}
            className={cn(
              "w-full p-4 flex items-center gap-3 border-b border-border/50 transition-colors text-left",
              activeChatId === chat.id && "bg-accent",
            )}
          >
            <div className="relative font-exo">
              <Avatar className="h-12 w-12">
                {chat.participantAvatar ? (
                  <AvatarImage src={chat.participantAvatar} alt={chat.participantName} />
                ) : null}
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
                <p className="font-medium truncate font-exo">{chat.participantName}</p>
                <div className="flex items-center gap-2 shrink-0">
                  {/* {chat.status === "pending" ? (
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      Pending
                    </span>
                  ) : null} */}
                  <span className="text-xs text-muted-foreground ">
                    {chat.messages[chat.messages.length - 1]?.timestamp || ""}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground truncate ">
                  {chat.isGroup ? chat.participantUsername : `@${chat.participantUsername}`}
                </p>
                {chat.isGroup ? (
                  <UserStatusIndicator
                    isOnline={isOnline}
                    isViewing={isViewing}
                    showViewingStatus={true}
                    size="sm"
                  />
                ) : null}
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
  )
}
