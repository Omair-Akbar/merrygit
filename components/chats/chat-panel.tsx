"use client"

import type { RefObject } from "react"
import { Fragment } from "react"
import Link from "next/link"
import { AnimatePresence } from "framer-motion"
import { ArrowLeft, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserStatusIndicator } from "@/components/chats/user-status-indicator"
import { ChatInput } from "@/components/chats/chat-input"
import { ChatMessage } from "@/components/chats/chat-message"
import type { Chat } from "@/lib/store/slices/chat-slice"

interface ChatPanelProps {
  chat: Chat
  unlockedMessageId: string | null
  lockDisplayMode: "text" | "icon" | "custom"
  customLockText: string
  activePresence: { isOnline: boolean; isViewing: boolean }
  messagesEndRef: RefObject<HTMLDivElement>
  onMessageClick: (messageId: string) => void
  onSendMessage: (content: string, attachments?: File[]) => void
  onBack: () => void
  mode?: "chat" | "request"
  onAcceptRequest?: () => void
  onRejectRequest?: () => void
}

export function ChatPanel({
  chat,
  unlockedMessageId,
  lockDisplayMode,
  customLockText,
  activePresence,
  messagesEndRef,
  onMessageClick,
  onSendMessage,
  onBack,
  mode = "chat",
  onAcceptRequest,
  onRejectRequest,
}: ChatPanelProps) {
  const isRequestMode = mode === "request"
  let lastDayLabel: string | null = null

  return (
    <>
      <div className="h-16 border-b border-border flex items-center px-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Link href={`/user/${chat.participantUsername}`} className="flex items-center gap-3 flex-1">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                {chat.participantName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{chat.participantName}</p>
              <UserStatusIndicator
                isOnline={activePresence.isOnline || chat.isOnline || false}
                isViewing={activePresence.isViewing || chat.isViewing || false}
                showViewingStatus={true}
                size="sm"
              />
            </div>
            <p className="text-xs text-muted-foreground">@{chat.participantUsername}</p>
          </div>
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span className="hidden sm:inline">End-to-end encrypted</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {chat.messages.map((msg, index) => {
            const dayLabel = msg.dayLabel || null
            const isNewDay = dayLabel && dayLabel !== lastDayLabel
            if (isNewDay) {
              lastDayLabel = dayLabel
            }

            const previousMessage = chat.messages[index - 1]
            const isNewSender =
              !previousMessage ||
              previousMessage.senderId !== msg.senderId ||
              (previousMessage.dayLabel || null) !== dayLabel

            const shouldShowGroupMeta = Boolean(chat.isGroup && isNewSender)
            const senderName = msg.senderName || (msg.senderId === "me" ? "You" : "Unknown")

            return (
              <Fragment key={msg.id}>
                {isNewDay && (
                  <div className="flex items-center gap-3 py-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground font-medium">{dayLabel}</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}
                <ChatMessage
                  message={msg}
                  isUnlocked={unlockedMessageId === msg.id}
                  lockDisplayMode={lockDisplayMode}
                  customLockText={customLockText}
                  onMessageClick={onMessageClick}
                  showSenderMeta={shouldShowGroupMeta}
                  senderName={shouldShowGroupMeta ? senderName : undefined}
                  senderAvatar={shouldShowGroupMeta ? msg.senderAvatar : undefined}
                />
              </Fragment>
            )
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {isRequestMode ? (
        <div className="border-t border-border p-4 flex items-center gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onRejectRequest}
          >
            Reject
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onAcceptRequest}
          >
            Accept
          </Button>
        </div>
      ) : (
        <ChatInput onSendMessage={onSendMessage} />
      )}
    </>
  )
}
