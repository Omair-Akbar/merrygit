"use client"

import { useEffect, useMemo, useRef, useState, KeyboardEvent } from "react"
import { Users } from "lucide-react"
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
import { clearSearch, searchUserThunk, type UserProfile } from "@/lib/store/slices/user-slice"
import {
  createGroupThunk,
  uploadGroupAvatarThunk,
  inviteGroupMemberThunk,
  clearCreatingGroup,
  clearErrors,
} from "@/lib/store/slices/group-slice"
import { ChatSidebar } from "@/components/chats/chat-sidebar"
import { ChatHeader } from "@/components/chats/chat-header"
import { ChatEmptyState } from "@/components/chats/chat-empty-state"
import { ChatPanel } from "@/components/chats/chat-panel"
import { GroupDetails } from "@/components/chats/group-details"
import { BackgroundGradient } from "@/components/chats/chat-background"
import { GroupDetailsForm } from "@/components/chats/forms/group-details-form"
import { GroupAvatarForm } from "@/components/chats/forms/group-avatar-form"
import { GroupMembersForm } from "@/components/chats/forms/group-members-form"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"

interface ChatPageProps {
  view: "messages" | "requests"
  chatType?: "direct" | "group"
}

type GroupStep = "details" | "avatar" | "members"

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
  const { searchResults, isSearching, searchError } = useAppSelector((state) => state.user)
  const { creatingGroup, isLoadingCreate, isLoadingUploadAvatar, isLoadingInviteMember } = useAppSelector(
    (state) => state.group,
  )
  const currentUser = useAppSelector((state) => state.auth.user)

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isGroupCreateOpen, setIsGroupCreateOpen] = useState(false)
  const [groupStep, setGroupStep] = useState<GroupStep>("details")

  // Step 1: Details
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [groupSettings, setGroupSettings] = useState<GroupSettings>(DEFAULT_GROUP_SETTINGS)

  // Step 2: Avatar
  const [groupAvatarFile, setGroupAvatarFile] = useState<File | null>(null)
  const [groupAvatarPreview, setGroupAvatarPreview] = useState<string | null>(null)

  // Step 3: Members
  const [memberSearchQuery, setMemberSearchQuery] = useState("")
  const [memberSearchType, setMemberSearchType] = useState<"email" | "username">("username")
  const [hasMemberSearch, setHasMemberSearch] = useState(false)
  const [invitedMemberIds, setInvitedMemberIds] = useState<string[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const chatIdParam = searchParams.get("id")
  const isGroupView = view === "messages" && chatType === "group"
  const isActiveGroupChat = activeChat?.isGroup || false

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

  const exactMatches = useMemo(() => {
    const query = memberSearchQuery.trim().toLowerCase()
    if (!query) return []

    return searchResults.filter((result) => {
      const target = memberSearchType === "email" ? result.email : result.username
      return target?.toLowerCase() === query && !invitedMemberIds.includes(result.id)
    })
  }, [memberSearchQuery, memberSearchType, searchResults, invitedMemberIds])

  // ============ Group Creation Handlers ============

  const handleOpenGroupCreate = () => {
    setIsGroupCreateOpen(true)
    setGroupStep("details")
    setGroupName("")
    setGroupDescription("")
    setGroupSettings({ ...DEFAULT_GROUP_SETTINGS })
    setGroupAvatarFile(null)
    setGroupAvatarPreview(null)
    setMemberSearchQuery("")
    setMemberSearchType("username")
    setHasMemberSearch(false)
    setInvitedMemberIds([])
    dispatch(clearSearch())
    dispatch(clearCreatingGroup())
  }

  const handleCloseGroupCreate = () => {
    setIsGroupCreateOpen(false)
    setGroupStep("details")
    setGroupAvatarFile(null)
    setGroupAvatarPreview(null)
    setMemberSearchQuery("")
    setHasMemberSearch(false)
    setInvitedMemberIds([])
    dispatch(clearSearch())
    dispatch(clearCreatingGroup())
    dispatch(clearErrors())
  }

  // Step 1: Create Group
  const handleCreateGroupDetails = async () => {
    if (!groupName.trim()) {
      toast.error("Group name is required")
      return
    }

    try {
      const result = await dispatch(
        createGroupThunk({
          name: groupName.trim(),
          description: groupDescription.trim(),
          settings: groupSettings,
        }),
      ).unwrap()

      toast.success("Group created successfully!")
      setGroupStep("avatar")
    } catch (error: any) {
      toast.error(error?.message || "Failed to create group")
    }
  }

  // Step 2: Upload Avatar
  const handleUploadAvatar = async () => {
    if (!groupAvatarFile || !creatingGroup) return

    try {
      await dispatch(
        uploadGroupAvatarThunk({
          groupId: creatingGroup._id,
          file: groupAvatarFile,
        }),
      ).unwrap()

      toast.success("Avatar uploaded successfully!")
      setGroupStep("members")
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload avatar")
    }
  }

  const handleSkipAvatar = () => {
    setGroupStep("members")
  }

  const handleAvatarChange = (file: File) => {
    const url = URL.createObjectURL(file)
    setGroupAvatarFile(file)
    setGroupAvatarPreview(url)
  }

  const handleRemoveAvatar = () => {
    setGroupAvatarFile(null)
    setGroupAvatarPreview(null)
  }

  // Step 3: Invite Members
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

  const handleInviteMember = async (profile: UserProfile) => {
    if (!creatingGroup) return

    try {
      await dispatch(
        inviteGroupMemberThunk({
          groupId: creatingGroup._id,
          memberId: profile.id,
        }),
      ).unwrap()

      setInvitedMemberIds((prev) => [...prev, profile.id])
      toast.success(`${profile.name} invited successfully!`)
    } catch (error: any) {
      toast.error(error?.message || "Failed to invite member")
    }
  }

  const handleFinishGroupCreation = () => {
    toast.success("Group created successfully!")
    handleCloseGroupCreate()
  }

  const handleMemberSearchTypeChange = (type: "email" | "username") => {
    setMemberSearchType(type)
    setHasMemberSearch(false)
    dispatch(clearSearch())
  }

  // ============ Other Handlers ============

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

        <main className={cn("flex-1 flex min-h-0 flex-col", !activeChat && !isGroupCreateOpen && "hidden md:flex")}>
          {isGroupCreateOpen ? (
            <>
              {groupStep === "details" && (
                <GroupDetailsForm
                  name={groupName}
                  description={groupDescription}
                  settings={groupSettings}
                  isLoading={isLoadingCreate}
                  onNameChange={setGroupName}
                  onDescriptionChange={setGroupDescription}
                  onSettingsChange={setGroupSettings}
                  onNext={handleCreateGroupDetails}
                  onCancel={handleCloseGroupCreate}
                />
              )}

              {groupStep === "avatar" && creatingGroup && (
                <GroupAvatarForm
                  groupName={groupName}
                  avatarFile={groupAvatarFile}
                  avatarPreview={groupAvatarPreview}
                  isLoading={isLoadingUploadAvatar}
                  onAvatarChange={handleAvatarChange}
                  onAvatarRemove={handleRemoveAvatar}
                  onNext={handleUploadAvatar}
                  onBack={() => setGroupStep("details")}
                  onSkip={handleSkipAvatar}
                  onCancel={handleCloseGroupCreate}
                />
              )}

              {groupStep === "members" && creatingGroup && (
                <GroupMembersForm
                  memberSearchQuery={memberSearchQuery}
                  memberSearchType={memberSearchType}
                  hasMemberSearch={hasMemberSearch}
                  isSearching={isSearching}
                  searchError={searchError}
                  searchResults={exactMatches}
                  isInviting={isLoadingInviteMember}
                  isLoading={isLoadingInviteMember}
                  invitedMembersCount={invitedMemberIds.length}
                  onSearchQueryChange={setMemberSearchQuery}
                  onSearchTypeChange={handleMemberSearchTypeChange}
                  onSearch={handleMemberSearch}
                  onSearchKeyPress={handleMemberSearchKeyPress}
                  onInviteMember={handleInviteMember}
                  onBack={() => setGroupStep("avatar")}
                  onFinish={handleFinishGroupCreation}
                  onCancel={handleCloseGroupCreate}
                />
              )}
            </>
          ) : activeChat && isActiveGroupChat ? (
            <GroupDetails group={activeChat as any} onBack={() => setActiveChat(null)} />
          ) : activeChat ? (
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
