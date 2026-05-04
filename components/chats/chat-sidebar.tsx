"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import { Search, ChevronLeft, ChevronRight, Settings, UserPlus, MailQuestion, MessageSquare, Users, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserStatusIndicator } from "@/components/chat/user-status-indicator"
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
  const [searchQuery, setSearchQuery] = useState("")
  const isMobile = useIsMobile()
  const router = useRouter()
  const pathname = usePathname()

  const isDirectActive = view === "messages" && chatType === "direct"
  const isGroupActive = view === "messages" && chatType === "group"
  const isRequestsActive = view === "requests"
  const isFindUsersActive = pathname === "/find-users"
  const isProfileActive = pathname === "/profile"
  const isSettingsActive = pathname === "/settings"
  const shouldShowSidebar = isOpen && (!isMobile || !activeChat)

  const buttonClass = (isActive: boolean) =>
    cn(
      "h-14 w-14 flex items-center justify-center m-0.5 rounded-xl transition-colors bg-transparent",
      isActive ? "border border-blue-500/40 bg-blue-500/20 text-foreground hover:bg-blue-500/20" : "text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all",
    )

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

  const getPresence = (userId: string) => {
    return userPresence[userId] || { isOnline: false, isViewing: false }
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
              <div className="w-16 shrink-0 border-r border-border/60 bg-background/70 backdrop-blur-sm flex flex-col py-4">
                <Button
                  // variant="ghost"
                  size="icon"
                  className={buttonClass(isDirectActive)}
                  aria-label="Direct chats"
                  onClick={() => router.push("/chat?type=direct")}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button
                  // variant="ghost"
                  size="icon"
                  className={buttonClass(isGroupActive)}
                  aria-label="Group chats"
                  onClick={() => router.push("/chat?type=group")}
                >
                  <Users className="h-4 w-4" />
                </Button>
                <Button
                  // variant="ghost"
                  size="icon"
                  className={buttonClass(isRequestsActive)}
                  aria-label="Requests"
                  onClick={() => router.push("/chat?view=requests")}
                >
                  <MailQuestion className="h-4 w-4" />
                </Button>
                <Button
                  // variant="ghost"
                  size="icon"
                  className={buttonClass(isFindUsersActive)}
                  aria-label="Add friend"
                  onClick={() => router.push("/find-users")}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
                <Button
                  // variant="ghost"
                  size="icon"
                  className={buttonClass(isProfileActive)}
                  aria-label="Profile"
                  onClick={() => router.push("/profile")}
                >
                  <User className="h-4 w-4" />
                </Button>
                <div className="flex-1" />
                <Button
                  // variant="ghost"
                  size="icon"
                  className={buttonClass(isSettingsActive)}
                  aria-label="Settings"
                  onClick={() => router.push("/settings")}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight">{view === "requests" ? "Requests" : "Chats"}</h2>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={view === "messages" ? "Search conversations..." : "Search requests..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                </div>

                <div className="flex-1 relative overflow-hidden">
                  {filteredChats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                      <p>{view === "requests" ? "No message requests" : "No conversations yet"}</p>
                    </div>
                  ) : (
                    <div className="h-full overflow-y-auto">
                      {filteredChats.map((chat) => {
                        const presence = getPresence(chat.participantId)
                        const isOnline = presence.isOnline || chat.isOnline || false
                        const isViewing = presence.isViewing || chat.isViewing || false

                        return (
                          <motion.button
                            key={chat.id}
                            onClick={() => handleSelectChat(chat)}
                            whileHover={{ backgroundColor: "var(--color-accent)" }}
                            className={cn(
                              "w-full p-4 flex items-center gap-3 border-b border-border/50 transition-colors text-left",
                              activeChat?.id === chat.id && "bg-accent",
                            )}
                          >
                            <div className="relative font-exo">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-secondary text-secondary-foreground">
                                  {chat.participantName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium truncate font-exo">{chat.participantName}</p>
                                <span className="text-xs text-muted-foreground ">
                                  {chat.messages[chat.messages.length - 1]?.timestamp}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-muted-foreground truncate ">@{chat.participantUsername}</p>
                                <UserStatusIndicator
                                  isOnline={isOnline}
                                  isViewing={isViewing}
                                  showViewingStatus={true}
                                  size="sm"
                                />
                              </div>
                            </div>
                            {chat.unreadCount > 0 && (
                              <span className="h-5 min-w-5 px-1.5 rounded-full bg-foreground text-background text-xs flex items-center justify-center">
                                {chat.unreadCount}
                              </span>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
