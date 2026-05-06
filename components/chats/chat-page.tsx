"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import {
  acceptChatRequest,
  fetchDirectChatsThunk,
  fetchDirectMessagesThunk,
  rejectChatRequest,
  sendDirectMessageThunk,
  setActiveChat,
  setActiveChatId,
  unlockMessage,
} from "@/lib/store/slices/chat-slice"
import { ChatSidebar } from "@/components/chats/chat-sidebar"
import { ChatHeader } from "@/components/chats/chat-header"
import { ChatEmptyState } from "@/components/chats/chat-empty-state"
import { ChatPanel } from "@/components/chats/chat-panel"
import { BackgroundGradient } from "@/components/chats/chat-background"
import { cn } from "@/lib/utils"

interface ChatPageProps {
  view: "messages" | "requests"
  chatType?: "direct" | "group"
}

export function ChatPage({ view, chatType = "direct" }: ChatPageProps) {
  const dispatch = useAppDispatch()
  const {
    chats,
    activeChat,
    unlockedMessageId,
    userPresence,
    hasLoadedDirectChats,
    isLoadingChats,
    loadedMessagesByChatId,
    isLoadingMessagesByChatId,
  } = useAppSelector((state) => state.chat)
  const { lockDisplayMode, customLockText } = useAppSelector((state) => state.settings)

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const chatIdParam = searchParams.get("id")

  useEffect(() => {
    if (chatType !== "direct") return
    if (hasLoadedDirectChats || isLoadingChats) return
    dispatch(fetchDirectChatsThunk())
  }, [chatType, hasLoadedDirectChats, isLoadingChats, dispatch])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeChat?.messages])

  useEffect(() => {
    if (!chatIdParam || chats.length === 0) return
    if (activeChat?.id === chatIdParam) return
    dispatch(setActiveChatId(chatIdParam))
  }, [chatIdParam, chats, activeChat?.id, dispatch])

  useEffect(() => {
    if (!activeChat) return
    const isRequest = activeChat.isRequest || false
    const isGroup = activeChat.isGroup || false

    if (view === "requests" && !isRequest) {
      dispatch(setActiveChat(null))
      return
    }

    if (view === "messages" && isRequest) {
      dispatch(setActiveChat(null))
      return
    }

    if (view === "messages" && chatType === "group" && !isGroup) {
      dispatch(setActiveChat(null))
      return
    }

    if (view === "messages" && chatType === "direct" && isGroup) {
      dispatch(setActiveChat(null))
    }
  }, [activeChat, view, chatType, dispatch])

  useEffect(() => {
    if (!activeChat || chatType !== "direct") return
    if (loadedMessagesByChatId[activeChat.id]) return
    if (isLoadingMessagesByChatId[activeChat.id]) return
    dispatch(fetchDirectMessagesThunk({ chatId: activeChat.id }))
  }, [activeChat, chatType, loadedMessagesByChatId, isLoadingMessagesByChatId, dispatch])

  const handleSendMessage = (content: string, _attachments?: File[]) => {
    if (!activeChat || !content.trim()) return
    dispatch(sendDirectMessageThunk({ chatId: activeChat.id, text: content.trim() }))
  }

  const handleMessageClick = (messageId: string) => {
    dispatch(unlockMessage(messageId))
  }

  const handleSelectChat = (chat: (typeof chats)[number]) => {
    dispatch(setActiveChat(chat))
    router.push(`/chats?id=${chat.id}`)
  }

  const handleAcceptRequest = () => {
    if (!activeChat) return
    dispatch(acceptChatRequest(activeChat.id))
    router.push("/chats")
  }

  const handleRejectRequest = () => {
    if (!activeChat) return
    dispatch(rejectChatRequest(activeChat.id))
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
