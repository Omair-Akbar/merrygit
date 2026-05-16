// ─────────────────────────────────────────────────────────────
// chat-slice.ts  (entry point — drop-in replacement)
//
// Composes direct-chat-slice and group-chat-slice into a single
// Redux slice so all existing imports keep working unchanged.
// ─────────────────────────────────────────────────────────────

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
      const chat = state.chats.find((c) => c.id === action.payload.chatId)
      if (chat) {
        chat.messages.push(action.payload.message)
        chat.lastMessage = action.payload.message
      }
      if (state.activeChat?.id === action.payload.chatId) {
        state.activeChat.messages.push(action.payload.message)
        state.activeChat.lastMessage = action.payload.message
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

    setTyping: (state, action: PayloadAction<{ chatId: string; isTyping: boolean }>) => {
      state.typingByChatId[action.payload.chatId] = action.payload.isTyping
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