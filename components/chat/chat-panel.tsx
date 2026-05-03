"use client"

import type React from "react"
import Link from "next/link"
import { AnimatePresence } from "framer-motion"
import { ArrowLeft, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserStatusIndicator } from "@/components/chat/user-status-indicator"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatMessage } from "@/components/chat/chat-message"
import type { Chat } from "@/lib/store/slices/chat-slice"

interface ChatPanelProps {
  chat: Chat
  unlockedMessageId: string | null
  lockDisplayMode: "text" | "icon" | "custom"
  customLockText: string
  activePresence: { isOnline: boolean; isViewing: boolean }
  messagesEndRef: React.RefObject<HTMLDivElement>
  onMessageClick: (messageId: string) => void
  onSendMessage: (content: string, attachments?: File[]) => void
  onBack: () => void
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
}: ChatPanelProps) {
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
          {chat.messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isUnlocked={unlockedMessageId === msg.id}
              lockDisplayMode={lockDisplayMode}
              customLockText={customLockText}
              onMessageClick={onMessageClick}
            />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSendMessage={onSendMessage} />
    </>
  )
}
