"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { useSocket } from "@/hooks/use-socket"
import { unlockMessage, type Chat, type Message } from "@/lib/store/slices/chat-slice"
import { ChatSidebar } from "@/components/chats/chat-sidebar"
import { ChatHeader } from "@/components/chats/chat-header"
import { ChatEmptyState } from "@/components/chats/chat-empty-state"
import { ChatPanel } from "@/components/chats/chat-panel"
import { BackgroundGradient } from "@/components/chats/chat-background"
import { mockChats } from "@/app/chats/mock-chats"
import { cn } from "@/lib/utils"

interface ChatPageProps {
  view: "messages" | "requests"
  chatType?: "direct" | "group"
}

export function ChatPage({ view, chatType = "direct" }: ChatPageProps) {
  const dispatch = useAppDispatch()
  const { unlockedMessageId, userPresence } = useAppSelector((state) => state.chat)
  const { lockDisplayMode, customLockText } = useAppSelector((state) => state.settings)

  const [chats, setChats] = useState<Chat[]>(mockChats)
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const { setViewingChat, setNotViewingChat } = useSocket()

  useEffect(() => {
    if (activeChat) {
      setViewingChat(activeChat.id)
    }
    return () => {
      if (activeChat) {
        setNotViewingChat(activeChat.id)
      }
    }
  }, [activeChat, setViewingChat, setNotViewingChat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeChat?.messages])

  useEffect(() => {
    if (!activeChat) return
    const isRequest = activeChat.isRequest || false
    const isGroup = activeChat.isGroup || false

    if (view === "requests" && !isRequest) {
      setActiveChat(null)
      return
    }

    if (view === "messages" && isRequest) {
      setActiveChat(null)
      return
    }

    if (view === "messages" && chatType === "group" && !isGroup) {
      setActiveChat(null)
      return
    }

    if (view === "messages" && chatType === "direct" && isGroup) {
      setActiveChat(null)
    }
  }, [activeChat, view, chatType])

  const handleSendMessage = (content: string, attachments?: File[]) => {
    if (!activeChat) return

    const attachmentUrls = attachments?.map((file) => URL.createObjectURL(file))
    const now = new Date()

    const newMessage: Message = {
      id: `m${Date.now()}`,
      content,
      senderId: "me",
      receiverId: activeChat.participantId,
      timestamp: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      dayLabel: now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }),
      isEncrypted: true,
      isRead: false,
      attachments: attachmentUrls,
    }

    setActiveChat({
      ...activeChat,
      messages: [...activeChat.messages, newMessage],
    })

    setChats((prev) =>
      prev.map((chat) => (chat.id === activeChat.id ? { ...chat, messages: [...chat.messages, newMessage] } : chat)),
    )

    dispatch(unlockMessage(newMessage.id))
  }

  const handleMessageClick = (messageId: string) => {
    dispatch(unlockMessage(messageId))
  }

  const handleSelectChat = (chat: Chat) => {
    setActiveChat(chat)
  }

  const handleAcceptRequest = () => {
    if (!activeChat) return
    setChats((prev) => prev.map((chat) => (chat.id === activeChat.id ? { ...chat, isRequest: false } : chat)))
    setActiveChat((prev) => (prev ? { ...prev, isRequest: false } : prev))
    router.push("/chats")
  }

  const handleRejectRequest = () => {
    if (!activeChat) return
    setChats((prev) => prev.filter((chat) => chat.id !== activeChat.id))
    setActiveChat(null)
  }

  const getActiveUserPresence = () => {
    if (!activeChat) return { isOnline: false, isViewing: false }
    return (
      userPresence[activeChat.participantId] || {
        isOnline: activeChat.isOnline || false,
        isViewing: activeChat.isViewing || false,
      }
    )
  }

  const activePresence = getActiveUserPresence()

  return (
    <div className="h-screen flex flex-col bg-background">
      <ChatHeader />
      <BackgroundGradient />

      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        <ChatSidebar
          chats={chats}
          activeChat={activeChat}
          onSelectChat={handleSelectChat}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          view={view}
          chatType={chatType}
        />

        <main className={cn("flex-1 flex min-h-0 flex-col", !activeChat && "hidden md:flex")}>
          {activeChat ? (
            <ChatPanel
              chat={activeChat}
              unlockedMessageId={unlockedMessageId}
              lockDisplayMode={lockDisplayMode}
              customLockText={customLockText}
              activePresence={activePresence}
              messagesEndRef={messagesEndRef}
              onMessageClick={handleMessageClick}
              onSendMessage={handleSendMessage}
              onBack={() => setActiveChat(null)}
              mode={view === "requests" ? "request" : "chat"}
              onAcceptRequest={handleAcceptRequest}
              onRejectRequest={handleRejectRequest}
            />
          ) : (
            <ChatEmptyState />
          )}
        </main>
      </div>
    </div>
  )
}
