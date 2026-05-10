"use client"

import type { RefObject } from "react"
import { Fragment } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  isTyping?: boolean
  messagesEndRef: RefObject<HTMLDivElement | null>
  onMessageClick: (messageId: string) => void
  onSendMessage: (content: string, attachments?: File[]) => void
  onTypingStart?: () => void
  onTypingStop?: () => void
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
  isTyping = false,
  messagesEndRef,
  onMessageClick,
  onSendMessage,
  onTypingStart,
  onTypingStop,
  onBack,
  mode = "chat",
  onAcceptRequest,
  onRejectRequest,
}: ChatPanelProps) {
  const isRequestMode = mode === "request"
  let lastDayLabel: string | null = null

  const emailValue = chat.participantEmail || "Not available"
  const phoneValue = chat.participantPhoneNumber
    ? chat.participantPhoneVisibility === "only_me"
      ? "Hidden"
      : chat.participantPhoneNumber
    : "Not available"
  const lastSeenValue = chat.participantLastSeen
    ? new Date(chat.participantLastSeen).toLocaleString()
    : "Unknown"
  const timezoneValue = chat.participantTimezone || "Unknown"

  return (
    <>
      <div className="h-16 border-b border-border flex items-center px-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Link href={`/user/${chat.participantUsername}`} className="flex items-center gap-3 flex-1">
          <div className="relative">
            <Avatar className="h-10 w-10">
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

      {isRequestMode ? (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="rounded-xl border border-border bg-background/60 p-5">
            <h3 className="text-sm font-semibold">User details</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Review the request details before accepting or rejecting.
            </p>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Email</span>
                <span className="truncate max-w-[60%] text-right">{emailValue}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Phone</span>
                <span className="truncate max-w-[60%] text-right">{phoneValue}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Timezone</span>
                <span className="truncate max-w-[60%] text-right">{timezoneValue}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Last seen</span>
                <span className="truncate max-w-[60%] text-right">{lastSeenValue}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
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
      )}

      {/* Typing indicator — fixed strip above the input, never scrolls */}
      {!isRequestMode && (
        <AnimatePresence>
          {isTyping && (
            <motion.div
              key="typing-indicator"
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="px-4 py-2 flex justify-start"
            >
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm px-4 py-3 bg-gray-800/5 dark:bg-white/5 border border-purple-400/20">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="block h-2 w-2 rounded-full bg-muted-foreground/60"
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

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
        <ChatInput onSendMessage={onSendMessage} onTypingStart={onTypingStart} onTypingStop={onTypingStop} />
      )}
    </>
  )
}
