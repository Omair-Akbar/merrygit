// ─────────────────────────────────────────────────────────────
// chat-types.ts
// Shared types, interfaces, initial state, and utility helpers
// used by both direct-chat-slice and group-chat-slice.
// ─────────────────────────────────────────────────────────────

export interface Message {
  id: string
  content: string
  senderId: string
  senderName?: string
  senderAvatar?: string
  receiverId: string
  timestamp: string
  dayLabel?: string
  isEncrypted: boolean
  isRead: boolean
  attachments?: string[]
}

export interface Chat {
  id: string
  participantId: string
  participantName: string
  participantUsername: string
  participantAvatar?: string
  participantEmail?: string
  participantPhoneNumber?: string
  participantPhoneVisibility?: string
  participantLastSeen?: string
  participantTimezone?: string
  lastMessage?: Message
  lastMessageAt?: string
  unreadCount: number
  messages: Message[]
  isOnline: boolean
  isViewing: boolean
  isRequest?: boolean
  isGroup?: boolean
  status?: "pending" | "active" | "blocked"
}

export interface UserPresence {
  isOnline: boolean
  isViewing: boolean
  lastSeen?: string
}

export interface ChatState {
  chats: Chat[]
  activeChat: Chat | null
  unlockedMessageId: string | null
  isLoading: boolean
  error: string | null
  typingByChatId: Record<string, boolean>
  userPresence: Record<string, UserPresence>

  // Direct chat creation
  isCreatingDirectChat: boolean
  creatingDirectChatUserId: string | null
  createChatError: string | null
  lastCreatedChatId: string | null

  // Direct chat list
  isLoadingChats: boolean
  chatsError: string | null
  hasLoadedDirectChats: boolean

  // Direct chat requests
  isLoadingRequests: boolean
  requestsError: string | null
  hasLoadedDirectRequests: boolean

  // Direct messages (per chat)
  isLoadingMessagesByChatId: Record<string, boolean>
  loadedMessagesByChatId: Record<string, boolean>
  messagesErrorByChatId: Record<string, string | null>

  // Group messages (per group)
  isLoadingGroupMessagesByChatId: Record<string, boolean>
  loadedGroupMessagesByChatId: Record<string, boolean>
  groupMessagesErrorByChatId: Record<string, string | null>
  groupMessagesByChatId: Record<string, Message[]>
  groupLastMessageAtByChatId: Record<string, string | null>

  // Request responses (per chat)
  isRespondingToRequestByChatId: Record<string, boolean>
  respondRequestErrorByChatId: Record<string, string | null>
}

export const initialChatState: ChatState = {
  chats: [],
  activeChat: null,
  unlockedMessageId: null,
  isLoading: false,
  error: null,
  typingByChatId: {},
  userPresence: {},

  isCreatingDirectChat: false,
  creatingDirectChatUserId: null,
  createChatError: null,
  lastCreatedChatId: null,

  isLoadingChats: false,
  chatsError: null,
  hasLoadedDirectChats: false,

  isLoadingRequests: false,
  requestsError: null,
  hasLoadedDirectRequests: false,

  isLoadingMessagesByChatId: {},
  loadedMessagesByChatId: {},
  messagesErrorByChatId: {},

  isLoadingGroupMessagesByChatId: {},
  loadedGroupMessagesByChatId: {},
  groupMessagesErrorByChatId: {},
  groupMessagesByChatId: {},
  groupLastMessageAtByChatId: {},

  isRespondingToRequestByChatId: {},
  respondRequestErrorByChatId: {},
}

// ── Shared utility helpers ────────────────────────────────────

export const formatMessageTimestamp = (isoDate: string) =>
  new Date(isoDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

export const formatMessageDayLabel = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  })

export const mapApiMessageToMessage = (
  message: {
    _id: string
    senderId: string
    text: string
    seenBy: string[]
    createdAt: string
    sender?: { name: string; avatar: string | null }
  },
  currentUserId: string | null,
): Message => {
  const isMe = Boolean(currentUserId && message.senderId === currentUserId)
  return {
    id: message._id,
    content: message.text,
    senderId: isMe ? "me" : message.senderId,
    senderName: message.sender?.name,
    senderAvatar: message.sender?.avatar || undefined,
    receiverId: "",
    timestamp: formatMessageTimestamp(message.createdAt),
    dayLabel: formatMessageDayLabel(message.createdAt),
    isEncrypted: true,
    isRead: currentUserId ? message.seenBy.includes(currentUserId) : false,
  }
}

export const getLatestMessageCreatedAt = (messages: Array<{ createdAt: string }>) => {
  if (messages.length === 0) return undefined
  return messages[messages.length - 1].createdAt
}

export const getChatSortTime = (chat: Chat) => {
  const candidate = chat.lastMessageAt || chat.messages[chat.messages.length - 1]?.timestamp
  if (!candidate) return 0
  const parsedTime = Date.parse(candidate)
  return Number.isNaN(parsedTime) ? 0 : parsedTime
}

export const upsertDirectChat = (state: ChatState, chat: Chat) => {
  const existingIndex = state.chats.findIndex((item) => item.id === chat.id)
  if (existingIndex >= 0) {
    state.chats[existingIndex] = { ...state.chats[existingIndex], ...chat }
    return
  }
  state.chats = [...state.chats, chat].sort((a, b) => getChatSortTime(b) - getChatSortTime(a))
}