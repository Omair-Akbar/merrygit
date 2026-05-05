import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

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
  lastMessage?: Message
  unreadCount: number
  messages: Message[]
  isOnline: boolean
  isViewing: boolean
  isRequest?: boolean
  isGroup?: boolean
}

export interface UserPresence {
  isOnline: boolean
  isViewing: boolean
  lastSeen?: string
}

interface ChatState {
  chats: Chat[]
  activeChat: Chat | null
  unlockedMessageId: string | null
  isLoading: boolean
  error: string | null
  isTyping: boolean
  userPresence: Record<string, UserPresence>
}

const initialState: ChatState = {
  chats: [],
  activeChat: null,
  unlockedMessageId: null,
  isLoading: false,
  error: null,
  isTyping: false,
  userPresence: {},
}

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload
    },
    setActiveChat: (state, action: PayloadAction<Chat | null>) => {
      state.activeChat = action.payload
    },
    addMessage: (state, action: PayloadAction<{ chatId: string; message: Message }>) => {
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
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload
    },
    markMessagesRead: (state, action: PayloadAction<string>) => {
      const chat = state.chats.find((c) => c.id === action.payload)
      if (chat) {
        chat.messages.forEach((m) => (m.isRead = true))
        chat.unreadCount = 0
      }
    },
    setUserOnline: (state, action: PayloadAction<{ userId: string; isOnline: boolean }>) => {
      const { userId, isOnline } = action.payload
      if (!state.userPresence[userId]) {
        state.userPresence[userId] = { isOnline: false, isViewing: false }
      }
      state.userPresence[userId].isOnline = isOnline

      // Update chat if it exists
      const chat = state.chats.find((c) => c.participantId === userId)
      if (chat) {
        chat.isOnline = isOnline
      }
      if (state.activeChat?.participantId === userId) {
        state.activeChat.isOnline = isOnline
      }
    },
    setUserViewing: (state, action: PayloadAction<{ userId: string; isViewing: boolean }>) => {
      const { userId, isViewing } = action.payload
      if (!state.userPresence[userId]) {
        state.userPresence[userId] = { isOnline: false, isViewing: false }
      }
      state.userPresence[userId].isViewing = isViewing

      // Update chat if it exists
      const chat = state.chats.find((c) => c.participantId === userId)
      if (chat) {
        chat.isViewing = isViewing
      }
      if (state.activeChat?.participantId === userId) {
        state.activeChat.isViewing = isViewing
      }
    },
  },
})

export const {
  setChats,
  setActiveChat,
  addMessage,
  unlockMessage,
  setLoading,
  setError,
  setTyping,
  markMessagesRead,
  setUserOnline,
  setUserViewing,
} = chatSlice.actions
export default chatSlice.reducer
