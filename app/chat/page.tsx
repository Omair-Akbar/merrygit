"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, ArrowLeft, Shield, Lock } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/ui/logo"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserStatusIndicator } from "@/components/chat/user-status-indicator"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { useSocket } from "@/hooks/use-socket"
import { unlockMessage, type Message, type Chat } from "@/lib/store/slices/chat-slice"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatMessage } from "@/components/chat/chat-message"
import { cn } from "@/lib/utils"

// Mock data for demo with online/viewing status
const mockChats: Chat[] = [
  {
    id: "1",
    participantId: "user1",
    participantName: "Alice Johnson",
    participantUsername: "alice",
    unreadCount: 2,
    isOnline: true,
    isViewing: true,
    messages: [
      {
        id: "m1",
        content: "Hey, how are you?",
        senderId: "user1",
        receiverId: "me",
        timestamp: "10:30 AM",
        isEncrypted: true,
        isRead: true,
      },
      {
        id: "m2",
        content: "I'm good, thanks! How about you?",
        senderId: "me",
        receiverId: "user1",
        timestamp: "10:31 AM",
        isEncrypted: true,
        isRead: true,
      },
      {
        id: "m3",
        content: "Did you get the documents I sent?",
        senderId: "user1",
        receiverId: "me",
        timestamp: "10:32 AM",
        isEncrypted: true,
        isRead: false,
      },
      {
        id: "m4",
        content: "Yes, reviewing them now!",
        senderId: "me",
        receiverId: "user1",
        timestamp: "10:33 AM",
        isEncrypted: true,
        isRead: true,
      },
      {
        id: "m5",
        content: "Great, let me know your thoughts.",
        senderId: "user1",
        receiverId: "me",
        timestamp: "10:34 AM",
        isEncrypted: true,
        isRead: false,
      },
    ],
  },
  {
    id: "2",
    participantId: "user2",
    participantName: "Bob Smith",
    participantUsername: "bobsmith",
    unreadCount: 0,
    isOnline: true,
    isViewing: false,
    messages: [
      {
        id: "m6",
        content: "Meeting at 3pm tomorrow?",
        senderId: "user2",
        receiverId: "me",
        timestamp: "9:15 AM",
        isEncrypted: true,
        isRead: true,
      },
      {
        id: "m7",
        content: "Sure, works for me!",
        senderId: "me",
        receiverId: "user2",
        timestamp: "9:20 AM",
        isEncrypted: true,
        isRead: true,
      },
    ],
  },
  {
    id: "3",
    participantId: "user3",
    participantName: "Carol Davis",
    participantUsername: "carol_d",
    unreadCount: 5,
    isOnline: false,
    isViewing: false,
    messages: [
      {
        id: "m8",
        content: "Check out this encrypted file",
        senderId: "user3",
        receiverId: "me",
        timestamp: "Yesterday",
        isEncrypted: true,
        isRead: false,
      },
    ],
  },
]

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
      <header className="h-14 border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {/* <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="h-5 w-5" />
          </Button> */}
          <Logo size={28} />
          <span className="font-semibold hidden sm:inline">MerryGit</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <ChatSidebar
          chats={chats}
          activeChat={activeChat}
          onSelectChat={handleSelectChat}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className={cn("flex-1 flex flex-col", !activeChat && "hidden md:flex")}>
          {activeChat ? (
            <>
              <div className="h-16 border-b border-border flex items-center px-4">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setActiveChat(null)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Link href={`/user/${activeChat.participantUsername}`} className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {activeChat.participantName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{activeChat.participantName}</p>
                      <UserStatusIndicator
                        isOnline={activePresence.isOnline || activeChat.isOnline || false}
                        isViewing={activePresence.isViewing || activeChat.isViewing || false}
                        showViewingStatus={true}
                        size="sm"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">@{activeChat.participantUsername}</p>
                  </div>
                </Link>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span className="hidden sm:inline">End-to-end encrypted</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <AnimatePresence mode="popLayout">
                  {activeChat.messages.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      isUnlocked={unlockedMessageId === msg.id}
                      lockDisplayMode={lockDisplayMode}
                      customLockText={customLockText}
                      onMessageClick={handleMessageClick}
                    />
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              <ChatInput onSendMessage={handleSendMessage} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
                <Logo size={64} className="mx-auto" />
                <div>
                  <h2 className="text-xl font-semibold">Welcome to MerryGit</h2>
                  <p className="text-muted-foreground">Select a conversation to start messaging</p>
                </div>
              </motion.div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
