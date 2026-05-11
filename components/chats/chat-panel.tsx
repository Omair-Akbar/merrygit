"use client"

import type { RefObject } from "react"
import { Fragment, useState } from "react"
import Link from "next/link"
import { AnimatePresence } from "framer-motion"
import { ArrowLeft, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserStatusIndicator } from "@/components/chats/user-status-indicator"
import { ChatInput } from "@/components/chats/chat-input"
import { ChatMessage } from "@/components/chats/chat-message"
import { Skeleton } from "@/components/ui/skeleton"
import { UserDetailsModal } from "@/components/ui/user-details-modal"
import type { Chat } from "@/lib/store/slices/chat-slice"

interface ChatPanelProps {
  chat: Chat
  unlockedMessageId: string | null
  lockDisplayMode: "text" | "icon" | "custom"
  customLockText: string
  activePresence: { isOnline: boolean; isViewing: boolean }
  messagesEndRef: RefObject<HTMLDivElement | null>
  onMessageClick: (messageId: string) => void
  onSendMessage: (content: string, attachments?: File[]) => void
  onBack: () => void
  onGroupTitleClick?: () => void
  isLoadingMessages?: boolean
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
  onGroupTitleClick,
  isLoadingMessages = false,
  mode = "chat",
  onAcceptRequest,
  onRejectRequest,
}: ChatPanelProps) {
  const isRequestMode = mode === "request"
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
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
        {chat.isGroup ? (
          <button type="button" onClick={onGroupTitleClick} className="flex items-center gap-3 flex-1 text-left">
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
              </div>
              <p className="text-xs text-muted-foreground">{chat.participantUsername}</p>
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-3 flex-1">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(true)}
              className="relative hover:opacity-80 transition-opacity"
            >
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
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Link href={`/user/${chat.participantUsername}`} className="font-medium hover:underline">
                  {chat.participantName}
                </Link>
                <UserStatusIndicator
                  isOnline={activePresence.isOnline || chat.isOnline || false}
                  isViewing={activePresence.isViewing || chat.isViewing || false}
                  showViewingStatus={true}
                  size="sm"
                />
              </div>
              <p className="text-xs text-muted-foreground">@{chat.participantUsername}</p>
            </div>
          </div>
        )}
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
          {isLoadingMessages && chat.messages.length === 0 ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={`msg-skel-${index}`} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-10 w-full max-w-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
                      reserveAvatarSpace={chat.isGroup}
                    />
                  </Fragment>
                )
              })}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>
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
        <ChatInput onSendMessage={onSendMessage} />
      )}

      <UserDetailsModal
        open={isUserModalOpen}
        user={{
          name: chat.participantName,
          username: chat.participantUsername,
          email: chat.participantEmail,
          avatar: chat.participantAvatar,
          timezone: chat.participantTimezone,
        }}
        onOpenChange={setIsUserModalOpen}
      />
    </>
  )
}
