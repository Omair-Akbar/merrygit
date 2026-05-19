import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

// Types & shared state
import { initialChatState } from "./chat-types"
export type { Message, Chat, UserPresence, ChatState } from "./chat-types"

// Direct chat — thunks + reducer registrations
import { addDirectChatReducers } from "./direct-chat-slice"
export {
  createDirectChatThunk,
  fetchDirectChatsThunk,
  fetchDirectMessagesThunk,
  fetchDirectChatRequestsThunk,
  respondDirectChatRequestThunk,
  sendDirectMessageThunk,
} from "./direct-chat-slice"

// Group chat — thunks + reducer registrations
import { addGroupChatReducers } from "./group-chat-slice"
export {
  fetchGroupMessagesThunk,
  sendGroupMessageThunk,
} from "./group-chat-slice"

// ── Slice ─────────────────────────────────────────────────────

const chatSlice = createSlice({
  name: "chat",
  initialState: initialChatState,

  // ── Synchronous reducers (shared / UI concerns) ───────────
  reducers: {
    setChats: (state, action: PayloadAction<import("./chat-types").Chat[]>) => {
      state.chats = action.payload
    },

    setActiveChat: (state, action: PayloadAction<import("./chat-types").Chat | null>) => {
      state.activeChat = action.payload
    },

    setActiveChatId: (state, action: PayloadAction<string | null>) => {
      if (!action.payload) {
        state.activeChat = null
        return
      }
      state.activeChat = state.chats.find((item) => item.id === action.payload) || null
    },

    addMessage: (
      state,
      action: PayloadAction<{ chatId: string; message: import("./chat-types").Message }>,
    ) => {
      const { chatId, message } = action.payload
      const chat = state.chats.find((c) => c.id === action.payload.chatId)
      if (chat) {
        chat.messages.push(message)
        chat.lastMessage = message
      }
      if (state.activeChat?.id === chatId) {
        state.activeChat.messages.push(message)
        state.activeChat.lastMessage = message
      }

      const shouldUpdateGroupMessages =
        Boolean(state.groupMessagesByChatId[chatId]) ||
        Boolean(state.activeChat?.id === chatId && state.activeChat.isGroup)

      if (shouldUpdateGroupMessages) {
        state.groupMessagesByChatId[chatId] = [
          ...(state.groupMessagesByChatId[chatId] || []),
          message,
        ]
        state.groupLastMessageAtByChatId[chatId] =
          message.createdAt || state.groupLastMessageAtByChatId[chatId] || new Date().toISOString()
      }
    },

    unlockMessage: (state, action: PayloadAction<string>) => {
      state.unlockedMessageId = action.payload
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },

    setTyping: (
      state,
      action: PayloadAction<{ chatId: string; isTyping: boolean; userId?: string }>,
    ) => {
      const { chatId, isTyping, userId } = action.payload
      if (!userId) {
        state.typingByChatId[chatId] = isTyping
        return
      }

      const existing = state.typingUsersByChatId[chatId] || []
      const updated = isTyping
        ? existing.includes(userId)
          ? existing
          : [...existing, userId]
        : existing.filter((id) => id !== userId)

      state.typingUsersByChatId[chatId] = updated
      state.typingByChatId[chatId] = updated.length > 0
    },

    markMessagesRead: (state, action: PayloadAction<string>) => {
      const chat = state.chats.find((c) => c.id === action.payload)
      if (chat) {
        chat.messages.forEach((m) => (m.isRead = true))
        chat.unreadCount = 0
      }
    },

    setUserOnline: (
      state,
      action: PayloadAction<{ userId: string; isOnline: boolean }>,
    ) => {
      const { userId, isOnline } = action.payload
      if (!state.userPresence[userId]) {
        state.userPresence[userId] = { isOnline: false, isViewing: false }
      }
      state.userPresence[userId].isOnline = isOnline

      const chat = state.chats.find((c) => c.participantId === userId)
      if (chat) chat.isOnline = isOnline
      if (state.activeChat?.participantId === userId) state.activeChat.isOnline = isOnline
    },

    setUserViewing: (
      state,
      action: PayloadAction<{ userId: string; isViewing: boolean }>,
    ) => {
      const { userId, isViewing } = action.payload
      if (!state.userPresence[userId]) {
        state.userPresence[userId] = { isOnline: false, isViewing: false }
      }
      state.userPresence[userId].isViewing = isViewing

      const chat = state.chats.find((c) => c.participantId === userId)
      if (chat) chat.isViewing = isViewing
      if (state.activeChat?.participantId === userId) state.activeChat.isViewing = isViewing
    },

    acceptChatRequest: (state, action: PayloadAction<string>) => {
      state.chats = state.chats.map((chat) =>
        chat.id === action.payload ? { ...chat, isRequest: false } : chat,
      )
      if (state.activeChat?.id === action.payload) {
        state.activeChat = { ...state.activeChat, isRequest: false }
      }
    },

    rejectChatRequest: (state, action: PayloadAction<string>) => {
      state.chats = state.chats.filter((chat) => chat.id !== action.payload)
      if (state.activeChat?.id === action.payload) state.activeChat = null
    },

    clearCreateChatState: (state) => {
      state.isCreatingDirectChat = false
      state.creatingDirectChatUserId = null
      state.createChatError = null
      state.lastCreatedChatId = null
    },
  },

  // ── Async reducers — delegated to domain slices ───────────
  extraReducers: (builder) => {
    addDirectChatReducers(builder)
    addGroupChatReducers(builder)
  },
})

// ── Action exports (unchanged public API) ─────────────────────
export const {
  setChats,
  setActiveChat,
  setActiveChatId,
  addMessage,
  unlockMessage,
  setLoading,
  setError,
  setTyping,
  markMessagesRead,
  setUserOnline,
  setUserViewing,
  acceptChatRequest,
  rejectChatRequest,
  clearCreateChatState,
} = chatSlice.actions

export default chatSlice.reducer