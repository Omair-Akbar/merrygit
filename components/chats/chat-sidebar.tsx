"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarNav } from "@/components/chats/sidebar/sidebar-nav"
import { SidebarHeader } from "@/components/chats/sidebar/sidebar-header"
import { SidebarChatList } from "@/components/chats/sidebar/sidebar-chat-list"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { unlockMessage, type Chat } from "@/lib/store/slices/chat-slice"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface ChatSidebarProps {
  chats: Chat[]
  activeChat: Chat | null
  onSelectChat: (chat: Chat) => void
  isOpen: boolean
  onToggle: () => void
  view?: "messages" | "requests"
  chatType?: "direct" | "group"
}

export function ChatSidebar({
  chats,
  activeChat,
  onSelectChat,
  isOpen,
  onToggle,
  view = "messages",
  chatType = "direct",
}: ChatSidebarProps) {
  const dispatch = useAppDispatch()
  const { userPresence } = useAppSelector((state) => state.chat)
  const user = useAppSelector((state) => state.auth.user)
  const [searchQuery, setSearchQuery] = useState("")
  const isMobile = useIsMobile()
  const router = useRouter()
  const pathname = usePathname()

  const isDirectActive = pathname === "/chats"
  const isGroupActive = pathname === "/chats/groups"
  const isRequestsActive = pathname === "/chats/requests"
  const isFindUsersActive = pathname === "/find-users"
  const isSettingsActive = pathname === "/settings"
  const shouldShowSidebar = isOpen && (!isMobile || !activeChat)

  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      chat.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.participantUsername.toLowerCase().includes(searchQuery.toLowerCase())

    const isRequest = (chat as Chat & { isRequest?: boolean }).isRequest || false
    const isGroup = (chat as Chat & { isGroup?: boolean }).isGroup || false
    if (view === "requests") return isRequest && matchesSearch
    if (isRequest) return false

    if (chatType === "group") return isGroup && matchesSearch
    return !isGroup && matchesSearch
  })

  const handleSelectChat = (chat: Chat) => {
    onSelectChat(chat)
    if (chat.messages.length > 0) {
      dispatch(unlockMessage(chat.messages[chat.messages.length - 1].id))
    }
  }

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className={cn(
          "absolute top-20 z-20 h-8 w-8 rounded-full border border-border bg-background shadow-sm transition-all hidden md:flex",
          isOpen ? "left-86.25" : "left-2.5",
        )}
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      <AnimatePresence>
        {shouldShowSidebar && (
          <motion.aside
            initial={{ width: 0, opacity: 0, x: isMobile ? -20 : 0 }}
            animate={{ width: isMobile ? "100%" : 360, opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: isMobile ? -20 : 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "border-r border-border flex bg-background overflow-hidden",
              "absolute md:relative z-10 h-full",
            )}
          >
            <div className="flex w-full h-full">
              <SidebarNav
                isDirectActive={isDirectActive}
                isGroupActive={isGroupActive}
                isRequestsActive={isRequestsActive}
                isFindUsersActive={isFindUsersActive}
                isSettingsActive={isSettingsActive}
                onNavigate={handleNavigate}
                user={user}
              />

              <div className="flex-1 flex flex-col">
                <SidebarHeader view={view} chatType={chatType} searchQuery={searchQuery} onSearchChange={setSearchQuery} />

                <div className="flex-1 relative overflow-hidden">
                  <SidebarChatList
                    chats={filteredChats}
                    activeChatId={activeChat?.id || null}
                    onSelectChat={handleSelectChat}
                    userPresence={userPresence}
                    view={view}
                  />
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
