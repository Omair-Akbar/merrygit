"use client"

import { useState, useEffect, useRef } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { useSocket } from "@/hooks/use-socket"
import { unlockMessage, type Message, type Chat } from "@/lib/store/slices/chat-slice"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { cn } from "@/lib/utils"
// import { ChatBackground } from "@/components/chat/chat-background"
import { ChatHeader } from "@/components/chat/chat-header"
import { ChatEmptyState } from "@/components/chat/chat-empty-state"
import { ChatPanel } from "@/components/chat/chat-panel"
import { mockChats } from "@/app/chat/mock-chats"
import { ChatBackground } from "@/components/chat/chat-background"

export default function ChatPage() {
  const dispatch = useAppDispatch()
  const { unlockedMessageId, userPresence } = useAppSelector((state) => state.chat)
  const { lockDisplayMode, customLockText } = useAppSelector((state) => state.settings)

  const [chats, setChats] = useState<Chat[]>(mockChats)
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  const handleSendMessage = (content: string, attachments?: File[]) => {
    if (!activeChat) return

    const attachmentUrls = attachments?.map((file) => URL.createObjectURL(file))

    const newMessage: Message = {
      id: `m${Date.now()}`,
      content,
      senderId: "me",
      receiverId: activeChat.participantId,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
      <ChatBackground />

      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        <ChatSidebar
          chats={chats}
          activeChat={activeChat}
          onSelectChat={handleSelectChat}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
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
            />
          ) : (
            <ChatEmptyState />
          )}
        </main>
      </div>
    </div>
  )
}
