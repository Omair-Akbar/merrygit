"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import {
  fetchDirectChatRequestsThunk,
  fetchDirectChatsThunk,
  fetchDirectMessagesThunk,
  respondDirectChatRequestThunk,
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
    hasLoadedDirectRequests,
    isLoadingRequests,
    isRespondingToRequestByChatId,
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
    if (view !== "messages") return
    if (chatType !== "direct") return
    if (hasLoadedDirectChats || isLoadingChats) return
    dispatch(fetchDirectChatsThunk())
  }, [view, chatType, hasLoadedDirectChats, isLoadingChats, dispatch])

  useEffect(() => {
    if (view !== "requests") return
    if (hasLoadedDirectRequests || isLoadingRequests) return
    dispatch(fetchDirectChatRequestsThunk())
  }, [view, hasLoadedDirectRequests, isLoadingRequests, dispatch])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeChat?.messages])

  useEffect(() => {
    if (!chatIdParam || chats.length === 0) return
    const matchedChat = chats.find((chat) => chat.id === chatIdParam)
    if (!matchedChat) return

    const isRequest = matchedChat.isRequest || false
    const isGroup = matchedChat.isGroup || false

    if (view === "requests" && !isRequest) return
    if (view === "messages" && isRequest) return
    if (view === "messages" && chatType === "group" && !isGroup) return
    if (view === "messages" && chatType === "direct" && isGroup) return
    if (activeChat?.id === chatIdParam) return

    dispatch(setActiveChatId(chatIdParam))
  }, [chatIdParam, chats, activeChat?.id, view, chatType, dispatch])

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
    if (!activeChat || chatType !== "direct" || view !== "messages") return
    if (loadedMessagesByChatId[activeChat.id]) return
    if (isLoadingMessagesByChatId[activeChat.id]) return
    dispatch(fetchDirectMessagesThunk({ chatId: activeChat.id }))
  }, [activeChat, chatType, view, loadedMessagesByChatId, isLoadingMessagesByChatId, dispatch])

  const sortedChats = useMemo(() => {
    const getSortTimestamp = (chat: (typeof chats)[number]) => {
      if (!chat.lastMessageAt) return 0
      const time = Date.parse(chat.lastMessageAt)
      return Number.isNaN(time) ? 0 : time
    }

    return [...chats].sort((a, b) => getSortTimestamp(b) - getSortTimestamp(a))
  }, [chats])

  const handleSendMessage = (content: string, _attachments?: File[]) => {
    if (!activeChat || !content.trim()) return
    dispatch(sendDirectMessageThunk({ chatId: activeChat.id, text: content.trim() }))
  }

  const handleMessageClick = (messageId: string) => {
    dispatch(unlockMessage(messageId))
  }

  const handleSelectChat = (chat: (typeof chats)[number]) => {
    dispatch(setActiveChat(chat))
    const nextPath = view === "requests" ? `/chats/requests?id=${chat.id}` : `/chats?id=${chat.id}`
    router.push(nextPath)
  }

  const handleAcceptRequest = async () => {
    if (!activeChat) return
    if (isRespondingToRequestByChatId[activeChat.id]) return

    try {
      const result = await dispatch(
        respondDirectChatRequestThunk({ chatId: activeChat.id, action: "accept" }),
      ).unwrap()
      router.push(`/chats?id=${result.chat._id}`)
    } catch (error) {
      console.error(error)
    }
  }

  const handleRejectRequest = async () => {
    if (!activeChat) return
    if (isRespondingToRequestByChatId[activeChat.id]) return

    try {
      await dispatch(
        respondDirectChatRequestThunk({ chatId: activeChat.id, action: "reject" }),
      ).unwrap()
    } catch (error) {
      console.error(error)
    }
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
    <div className="h-screen max-w-screen flex flex-col bg-background">
      <ChatHeader />
      <BackgroundGradient />

      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        <ChatSidebar
          chats={sortedChats}
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
