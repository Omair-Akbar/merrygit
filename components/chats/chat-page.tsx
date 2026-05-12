"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import { Search, UserPlus, Users, X, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { useSocket } from "@/hooks/use-socket"
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
import { clearSearch, searchUserThunk, type UserProfile } from "@/lib/store/slices/user-slice"
import { ChatSidebar } from "@/components/chats/chat-sidebar"
import { ChatHeader } from "@/components/chats/chat-header"
import { ChatEmptyState } from "@/components/chats/chat-empty-state"
import { ChatPanel } from "@/components/chats/chat-panel"
import { BackgroundGradient } from "@/components/chats/chat-background"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface ChatPageProps {
  view: "messages" | "requests"
  chatType?: "direct" | "group"
}

type GroupMemberRole = "owner" | "admin" | "member"
type GroupMemberStatus = "active" | "pending"

interface GroupMember {
  id: string
  name: string
  username: string
  email: string
  avatar?: string
  role: GroupMemberRole
  status: GroupMemberStatus
}

interface GroupSettings {
  anyoneCanAddMembers: boolean
  onlyAdminsCanSendMessages: boolean
  membersCanEditGroupInfo: boolean
}

const DEFAULT_GROUP_SETTINGS: GroupSettings = {
  anyoneCanAddMembers: true,
  onlyAdminsCanSendMessages: false,
  membersCanEditGroupInfo: false,
}

export function ChatPage({ view, chatType = "direct" }: ChatPageProps) {
  const dispatch = useAppDispatch()
  const { isConnected, sendMessage, startTyping, stopTyping, joinChat, leaveChat, setViewingChat, setNotViewingChat, markMessageRead } = useSocket()
  const {
    chats,
    activeChat,
    unlockedMessageId,
    userPresence,
    typingByChatId,
    hasLoadedDirectChats,
    isLoadingChats,
    hasLoadedDirectRequests,
    isLoadingRequests,
    isRespondingToRequestByChatId,
    loadedMessagesByChatId,
    isLoadingMessagesByChatId,
  } = useAppSelector((state) => state.chat)
  const { lockDisplayMode, customLockText } = useAppSelector((state) => state.settings)
  const { searchResults, isSearching, searchError } = useAppSelector((state) => state.user)
  const currentUser = useAppSelector((state) => state.auth.user)
  const lastViewingChatIdRef = useRef<string | null>(null)

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isGroupCreateOpen, setIsGroupCreateOpen] = useState(false)
  const [groupStep, setGroupStep] = useState<"details" | "members">("details")
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [groupSettings, setGroupSettings] = useState<GroupSettings>(DEFAULT_GROUP_SETTINGS)
  const [memberSearchQuery, setMemberSearchQuery] = useState("")
  const [memberSearchType, setMemberSearchType] = useState<"email" | "username">("username")
  const [hasMemberSearch, setHasMemberSearch] = useState(false)
  const [members, setMembers] = useState<GroupMember[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const chatIdParam = searchParams.get("id")
  const isGroupView = view === "messages" && chatType === "group"

  const ownerMember: GroupMember | null = currentUser
    ? {
        id: currentUser._id,
        name: currentUser.name,
        username: currentUser.username,
        email: currentUser.email,
        avatar: currentUser.avatar || undefined,
        role: "owner",
        status: "active",
      }
    : null

  useEffect(() => {
    if (view !== "messages") return
    if (chatType !== "direct") return
    
    // Always fetch on mount to ensure we don't miss chats created while away from the page
    dispatch(fetchDirectChatsThunk())
  }, [view, chatType, dispatch])

  useEffect(() => {
    if (view !== "requests") return
    
    // Always fetch on mount to ensure we don't miss requests created while away from the page
    dispatch(fetchDirectChatRequestsThunk())
  }, [view, dispatch])

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

  const isLoadingMessagesRef = useRef(isLoadingMessagesByChatId)
  useEffect(() => {
    isLoadingMessagesRef.current = isLoadingMessagesByChatId
  }, [isLoadingMessagesByChatId])

  useEffect(() => {
    if (!activeChat?.id || chatType !== "direct" || view !== "messages") return
    if (isLoadingMessagesRef.current[activeChat.id]) return
    
    // Always fetch messages when entering a chat to sync latest data
    dispatch(fetchDirectMessagesThunk({ chatId: activeChat.id }))
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChat?.id, chatType, view, dispatch])

  // Keep viewing state in sync across navigation and view changes
  useEffect(() => {
    if (!isConnected) return

    const nextChatId = activeChat?.id ?? null
    const prevChatId = lastViewingChatIdRef.current

    if (prevChatId && prevChatId !== nextChatId) {
      setNotViewingChat(prevChatId)
      leaveChat(prevChatId)
    }

    if (nextChatId) {
      joinChat(nextChatId)
      setViewingChat(nextChatId)
    }

    lastViewingChatIdRef.current = nextChatId

    return () => {
      if (nextChatId) {
        setNotViewingChat(nextChatId)
        leaveChat(nextChatId)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChat?.id, isConnected, view, chatType])

  const sortedChats = useMemo(() => {
    const getSortTimestamp = (chat: (typeof chats)[number]) => {
      if (!chat.lastMessageAt) return 0
      const time = Date.parse(chat.lastMessageAt)
      return Number.isNaN(time) ? 0 : time
    }

    return [...chats].sort((a, b) => getSortTimestamp(b) - getSortTimestamp(a))
  }, [chats])

  const exactMatches = useMemo(() => {
    const query = memberSearchQuery.trim().toLowerCase()
    if (!query) return []

    return searchResults.filter((result) => {
      const target = memberSearchType === "email" ? result.email : result.username
      return target?.toLowerCase() === query
    })
  }, [memberSearchQuery, memberSearchType, searchResults])

  const memberIds = useMemo(
    () => Array.from(new Set(members.map((member) => member.id))),
    [members],
  )

  const isGroupFormValid = groupName.trim().length > 0

  const handleOpenGroupCreate = () => {
    setIsGroupCreateOpen(true)
    setGroupStep("details")
    setGroupName("")
    setGroupDescription("")
    setGroupSettings({ ...DEFAULT_GROUP_SETTINGS })
    setMemberSearchQuery("")
    setMemberSearchType("username")
    setHasMemberSearch(false)
    dispatch(clearSearch())
    setMembers(ownerMember ? [ownerMember] : [])
  }

  const handleCloseGroupCreate = () => {
    setIsGroupCreateOpen(false)
    setGroupStep("details")
    setMemberSearchQuery("")
    setHasMemberSearch(false)
    dispatch(clearSearch())
  }

  const handleMemberSearch = () => {
    const query = memberSearchQuery.trim()
    if (!query) {
      dispatch(clearSearch())
      setHasMemberSearch(false)
      return
    }

    setHasMemberSearch(true)
    dispatch(searchUserThunk({ query, type: memberSearchType }))
  }

  const handleMemberSearchKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleMemberSearch()
    }
  }

  const handleMemberSearchTypeChange = (type: "email" | "username") => {
    setMemberSearchType(type)
    setHasMemberSearch(false)
    dispatch(clearSearch())
  }

  const handleAddMember = (profile: UserProfile) => {
    setMembers((prev) => {
      if (prev.some((member) => member.id === profile.id)) return prev

      return [
        ...prev,
        {
          id: profile.id,
          name: profile.name,
          username: profile.username,
          email: profile.email,
          avatar: profile.avatar,
          role: "member",
          status: "pending",
        },
      ]
    })
  }

  const handleRoleChange = (memberId: string, role: GroupMemberRole) => {
    setMembers((prev) =>
      prev.map((member) => (member.id === memberId ? { ...member, role } : member)),
    )
  }

  const handleRemoveMember = (memberId: string) => {
    setMembers((prev) => prev.filter((member) => member.id !== memberId))
  }

  const handleCreateGroup = () => {
    if (!isGroupFormValid) return

    const payload = {
      name: groupName.trim(),
      description: groupDescription.trim(),
      memberIds,
      settings: groupSettings,
    }

    console.log("Create group payload", payload)
  }

  const handleSendMessage = (content: string, _attachments?: File[]) => {
    if (!activeChat || !content.trim()) return
    dispatch(sendDirectMessageThunk({ chatId: activeChat.id, text: content.trim() }))
    
    // Emit message to socket
    if (currentUser) {
      sendMessage(activeChat.id, {
        content: content.trim(),
        senderId: currentUser._id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar || "",
        receiverId: activeChat.participantId,
        isEncrypted: false,
        isRead: false,
      })
    }
  }

  const handleMessageClick = (messageId: string) => {
    if (!activeChat) return

    // Find the clicked message
    const msg = activeChat.messages.find((m) => m.id === messageId)

    // Unlock the message in state
    dispatch(unlockMessage(messageId))

    if (msg) {
      const isLocked = unlockedMessageId !== messageId
      const isUnread = !msg.isRead

      // Emit message:read if:
      //  - Message is currently locked (user clicking to reveal it), OR
      //  - Message is already unlocked but hasn't been read yet
      if ((isLocked || isUnread) && msg.senderId !== "me") {
        markMessageRead(activeChat.id, messageId)
      }
    }
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
  const showGroupCreate = isGroupView && isGroupCreateOpen
  const headerAction = isGroupView ? (
    <Button
      size="sm"
      variant={isGroupCreateOpen ? "secondary" : "default"}
      onClick={isGroupCreateOpen ? handleCloseGroupCreate : handleOpenGroupCreate}
      className="gap-2"
    >
      <Users className="h-4 w-4" />
      {isGroupCreateOpen ? "Close" : "Create group"}
    </Button>
  ) : undefined

  return (
    <div className="h-screen max-w-screen flex flex-col bg-background">
      <ChatHeader action={headerAction} />
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

        <main className={cn("flex-1 flex min-h-0 flex-col", !activeChat && !showGroupCreate && "hidden md:flex")}>
          {showGroupCreate ? (
            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-2xl px-6 py-6 space-y-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Create group</h2>
                    <p className="text-sm text-muted-foreground">Add details and invite members.</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleCloseGroupCreate} className="gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground tracking-wide">
                  <span
                    className={cn(
                      "rounded-md border px-2 py-1",
                      groupStep === "details" ? "bg-accent text-foreground" : "border-border/60",
                    )}
                  >
                    Details
                  </span>
                  <span>/</span>
                  <span
                    className={cn(
                      "rounded-md border px-2 py-1",
                      groupStep === "members" ? "bg-accent text-foreground" : "border-border/60",
                    )}
                  >
                    Members
                  </span>
                </div>

                {groupStep === "details" ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="group-name">Group name</Label>
                      <Input
                        id="group-name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Personal talk"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="group-description">Description</Label>
                      <Textarea
                        id="group-description"
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                        placeholder="This is a group for personal discussion"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                        <div>
                          <p className="text-sm font-medium">Anyone can add members</p>
                          <p className="text-xs text-muted-foreground">Allow any member to invite others.</p>
                        </div>
                        <Switch
                          checked={groupSettings.anyoneCanAddMembers}
                          onCheckedChange={(checked) =>
                            setGroupSettings((prev) => ({ ...prev, anyoneCanAddMembers: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                        <div>
                          <p className="text-sm font-medium">Only admins can send messages</p>
                          <p className="text-xs text-muted-foreground">Restrict messaging to admins only.</p>
                        </div>
                        <Switch
                          checked={groupSettings.onlyAdminsCanSendMessages}
                          onCheckedChange={(checked) =>
                            setGroupSettings((prev) => ({ ...prev, onlyAdminsCanSendMessages: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                        <div>
                          <p className="text-sm font-medium">Members can edit group info</p>
                          <p className="text-xs text-muted-foreground">Let members update name or description.</p>
                        </div>
                        <Switch
                          checked={groupSettings.membersCanEditGroupInfo}
                          onCheckedChange={(checked) =>
                            setGroupSettings((prev) => ({ ...prev, membersCanEditGroupInfo: checked }))
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" onClick={handleCloseGroupCreate}>
                        Cancel
                      </Button>
                      <Button onClick={() => setGroupStep("members")} disabled={!isGroupFormValid}>
                        Next
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">Add members</h3>
                        <p className="text-sm text-muted-foreground">Search by exact username or email.</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setGroupStep("details")}>
                        Back
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant={memberSearchType === "username" ? "default" : "outline"}
                        onClick={() => handleMemberSearchTypeChange("username")}
                        className="flex-1"
                      >
                        Search by Username
                      </Button>
                      <Button
                        variant={memberSearchType === "email" ? "default" : "outline"}
                        onClick={() => handleMemberSearchTypeChange("email")}
                        className="flex-1"
                      >
                        Search by Email
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={
                            memberSearchType === "email"
                              ? "Enter exact email address..."
                              : "Enter exact username..."
                          }
                          value={memberSearchQuery}
                          onChange={(e) => setMemberSearchQuery(e.target.value)}
                          onKeyPress={handleMemberSearchKeyPress}
                          className="pl-9"
                        />
                      </div>
                      <Button onClick={handleMemberSearch} disabled={memberSearchQuery.trim().length === 0}>
                        Search
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {!hasMemberSearch ? (
                        <p className="text-sm text-muted-foreground">
                          Enter an exact {memberSearchType} to find a user.
                        </p>
                      ) : isSearching ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Searching...
                        </div>
                      ) : searchError ? (
                        <p className="text-sm text-muted-foreground">{searchError}</p>
                      ) : exactMatches.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No exact match found. Please check the {memberSearchType}.
                        </p>
                      ) : (
                        exactMatches.map((user) => {
                          const isAdded = members.some((member) => member.id === user.id)

                          return (
                            <div
                              key={user.id}
                              className="flex items-center gap-3 rounded-lg border border-border p-3"
                            >
                              <Avatar className="h-10 w-10">
                                {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
                                <AvatarFallback className="bg-secondary text-secondary-foreground">
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">@{user.username}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleAddMember(user)}
                                disabled={isAdded}
                                className="gap-2"
                              >
                                <UserPlus className="h-4 w-4" />
                                {isAdded ? "Added" : "Invite"}
                              </Button>
                            </div>
                          )
                        })
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          Members
                        </h3>
                        <Badge variant="secondary">{members.length} total</Badge>
                      </div>

                      {members.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No members added yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {members.map((member) => (
                            <div
                              key={member.id}
                              className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  {member.avatar ? (
                                    <AvatarImage src={member.avatar} alt={member.name} />
                                  ) : null}
                                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                                    {member.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="font-medium">{member.name}</p>
                                  <p className="text-xs text-muted-foreground">@{member.username}</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant={member.status === "pending" ? "secondary" : "outline"}>
                                  {member.status === "pending" ? "Pending" : "Active"}
                                </Badge>
                                {member.role === "owner" ? (
                                  <Badge variant="outline">Owner</Badge>
                                ) : (
                                  <Select
                                    value={member.role}
                                    onValueChange={(value) => handleRoleChange(member.id, value as GroupMemberRole)}
                                  >
                                    <SelectTrigger size="sm" className="min-w-30">
                                      <SelectValue placeholder="Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="admin">Admin</SelectItem>
                                      <SelectItem value="member">Member</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                                {member.role !== "owner" ? (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveMember(member.id)}
                                    aria-label={`Remove ${member.name}`}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" onClick={handleCloseGroupCreate}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateGroup} disabled={!isGroupFormValid}>
                        Create group
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : activeChat ? (
            <ChatPanel
              chat={activeChat}
              unlockedMessageId={unlockedMessageId}
              lockDisplayMode={lockDisplayMode}
              customLockText={customLockText}
              activePresence={activePresence}
              isTyping={typingByChatId[activeChat.id] ?? false}
              messagesEndRef={messagesEndRef}
              onMessageClick={handleMessageClick}
              onSendMessage={handleSendMessage}
              onTypingStart={() => startTyping(activeChat.id)}
              onTypingStop={() => stopTyping(activeChat.id)}
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