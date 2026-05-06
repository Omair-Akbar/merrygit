import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { createDirectChat, getDirectChats, getDirectMessages, sendDirectMessage } from "@/lib/api/chat-api"
import type { RootState } from "@/lib/store/store"

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
  isCreatingDirectChat: boolean
  creatingDirectChatUserId: string | null
  createChatError: string | null
  lastCreatedChatId: string | null
  isLoadingChats: boolean
  chatsError: string | null
  hasLoadedDirectChats: boolean
  isLoadingMessagesByChatId: Record<string, boolean>
  loadedMessagesByChatId: Record<string, boolean>
  messagesErrorByChatId: Record<string, string | null>
}

const initialState: ChatState = {
  chats: [],
  activeChat: null,
  unlockedMessageId: null,
  isLoading: false,
  error: null,
  isTyping: false,
  userPresence: {},
  isCreatingDirectChat: false,
  creatingDirectChatUserId: null,
  createChatError: null,
  lastCreatedChatId: null,
  isLoadingChats: false,
  chatsError: null,
  hasLoadedDirectChats: false,
  isLoadingMessagesByChatId: {},
  loadedMessagesByChatId: {},
  messagesErrorByChatId: {},
}

export const createDirectChatThunk = createAsyncThunk(
  "chat/createDirectChat",
  async ({ otherUserId }: { otherUserId: string }, { rejectWithValue }) => {
    try {
      const response = await createDirectChat(otherUserId)
      return {
        chatId: response.chat._id,
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create chat")
    }
  },
)

export const fetchDirectChatsThunk = createAsyncThunk(
  "chat/fetchDirectChats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getDirectChats()
      return response.data.chats
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch chats")
    }
  },
)

export const fetchDirectMessagesThunk = createAsyncThunk(
  "chat/fetchDirectMessages",
  async ({ chatId }: { chatId: string }, { rejectWithValue, getState }) => {
    try {
      const response = await getDirectMessages(chatId)
      const state = getState() as RootState
      const currentUserId = state.auth.user?._id || null
      return { chatId, messages: response.data.messages, currentUserId }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch messages")
    }
  },
)

export const sendDirectMessageThunk = createAsyncThunk(
  "chat/sendDirectMessage",
  async (
    { chatId, text, replyTo }: { chatId: string; text: string; replyTo?: string | null },
    { rejectWithValue, getState },
  ) => {
    try {
      const response = await sendDirectMessage({
        chatId,
        text,
        messageType: "text",
        chatType: "direct",
        replyTo: replyTo ?? null,
      })
      const state = getState() as RootState
      const currentUserId = state.auth.user?._id || null
      return { chatId, message: response.data, currentUserId }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to send message")
    }
  },
)

const formatMessageTimestamp = (isoDate: string) =>
  new Date(isoDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

const formatMessageDayLabel = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })

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
    setActiveChatId: (state, action: PayloadAction<string | null>) => {
      if (!action.payload) {
        state.activeChat = null
        return
      }
      const chat = state.chats.find((item) => item.id === action.payload) || null
      state.activeChat = chat
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
      if (state.activeChat?.id === action.payload) {
        state.activeChat = null
      }
    },
    clearCreateChatState: (state) => {
      state.isCreatingDirectChat = false
      state.creatingDirectChatUserId = null
      state.createChatError = null
      state.lastCreatedChatId = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDirectChatThunk.pending, (state, action) => {
        state.isCreatingDirectChat = true
        state.creatingDirectChatUserId = action.meta.arg.otherUserId
        state.createChatError = null
        state.lastCreatedChatId = null
      })
      .addCase(createDirectChatThunk.fulfilled, (state, action) => {
        state.isCreatingDirectChat = false
        state.creatingDirectChatUserId = null
        state.createChatError = null
        state.lastCreatedChatId = action.payload.chatId
      })
      .addCase(createDirectChatThunk.rejected, (state, action) => {
        state.isCreatingDirectChat = false
        state.creatingDirectChatUserId = null
        state.createChatError = action.payload as string
        state.lastCreatedChatId = null
      })
      .addCase(fetchDirectChatsThunk.pending, (state) => {
        state.isLoadingChats = true
        state.chatsError = null
      })
      .addCase(fetchDirectChatsThunk.fulfilled, (state, action) => {
        state.isLoadingChats = false
        state.chatsError = null
        state.hasLoadedDirectChats = true
        state.chats = action.payload.map((chat) => ({
          id: chat.chatId,
          participantId: chat.otherUser._id,
          participantName: chat.otherUser.name,
          participantUsername: chat.otherUser.username,
          participantAvatar: chat.otherUser.avatar || undefined,
          unreadCount: chat.unreadCount,
          isOnline: false,
          isViewing: false,
          isGroup: false,
          messages: [],
        }))
      })
      .addCase(fetchDirectChatsThunk.rejected, (state, action) => {
        state.isLoadingChats = false
        state.chatsError = action.payload as string
      })
      .addCase(fetchDirectMessagesThunk.pending, (state, action) => {
        state.isLoadingMessagesByChatId[action.meta.arg.chatId] = true
        state.messagesErrorByChatId[action.meta.arg.chatId] = null
      })
      .addCase(fetchDirectMessagesThunk.fulfilled, (state, action) => {
        const { chatId, messages, currentUserId } = action.payload
        state.isLoadingMessagesByChatId[chatId] = false
        state.loadedMessagesByChatId[chatId] = true
        state.messagesErrorByChatId[chatId] = null

        const mappedMessages: Message[] = messages.map((message) => {
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
        })

        state.chats = state.chats.map((chat) =>
          chat.id === chatId ? { ...chat, messages: mappedMessages } : chat,
        )

        if (state.activeChat?.id === chatId) {
          state.activeChat = { ...state.activeChat, messages: mappedMessages }
        }
      })
      .addCase(fetchDirectMessagesThunk.rejected, (state, action) => {
        const chatId = action.meta.arg.chatId
        state.isLoadingMessagesByChatId[chatId] = false
        state.messagesErrorByChatId[chatId] = action.payload as string
      })
      .addCase(sendDirectMessageThunk.fulfilled, (state, action) => {
        const { chatId, message, currentUserId } = action.payload
        const isMe = Boolean(currentUserId && message.senderId === currentUserId)
        const mappedMessage: Message = {
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

        state.chats = state.chats.map((chat) =>
          chat.id === chatId ? { ...chat, messages: [...chat.messages, mappedMessage] } : chat,
        )

        if (state.activeChat?.id === chatId) {
          state.activeChat = {
            ...state.activeChat,
            messages: [...state.activeChat.messages, mappedMessage],
          }
        }

        state.unlockedMessageId = mappedMessage.id
      })
  },
})

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
