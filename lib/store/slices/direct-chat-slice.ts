// ─────────────────────────────────────────────────────────────
// direct-chat-slice.ts
// Thunks and extra-reducer handlers for 1-to-1 (direct) chats.
// ─────────────────────────────────────────────────────────────

import { createAsyncThunk } from "@reduxjs/toolkit"
import type { ActionReducerMapBuilder } from "@reduxjs/toolkit"

import {
  createDirectChat,
  getDirectChatRequests,
  getDirectChats,
  getDirectMessages,
  respondDirectChatInvitation,
  sendDirectMessage,
} from "@/lib/api/chat-api"

import type { RootState } from "@/lib/store/store"
import type { ChatState, Message } from "./chat-types"
import {
  formatMessageTimestamp,
  formatMessageDayLabel,
  mapApiMessageToMessage,
  getLatestMessageCreatedAt,
  getChatSortTime,
  upsertDirectChat,
} from "./chat-types"

// ── Thunks ────────────────────────────────────────────────────

export const createDirectChatThunk = createAsyncThunk(
  "chat/createDirectChat",
  async (
    {
      otherUserId,
      otherUser,
    }: {
      otherUserId: string
      otherUser?: {
        id: string
        name: string
        username: string
        email: string
        avatar?: string | null
      }
    },
    { rejectWithValue, getState },
  ) => {
    try {
      const response = await createDirectChat(otherUserId)
      const state = getState() as RootState
      const currentUser = state.auth.user

      return {
        chatId: response.chat._id,
        status: response.chat.status as "pending" | "active" | "blocked",
        createdAt: response.chat.createdAt,
        updatedAt: response.chat.updatedAt,
        participants: response.chat.participants,
        currentUserId: currentUser?._id || null,
        otherUser: otherUser || null,
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

export const fetchDirectChatRequestsThunk = createAsyncThunk(
  "chat/fetchDirectChatRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getDirectChatRequests()
      return response.data.requests
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch requests")
    }
  },
)

export const respondDirectChatRequestThunk = createAsyncThunk(
  "chat/respondDirectChatRequest",
  async (
    { chatId, action }: { chatId: string; action: "accept" | "reject" },
    { rejectWithValue },
  ) => {
    try {
      const response = await respondDirectChatInvitation(chatId, action)
      return { chatId, action, chat: response.chat }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to respond to request")
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

// ── Extra-reducer handlers (called from the main slice) ───────

export const addDirectChatReducers = (builder: ActionReducerMapBuilder<ChatState>) => {
  builder
    // ── createDirectChat ──────────────────────────────────────
    .addCase(createDirectChatThunk.pending, (state, action) => {
      state.isCreatingDirectChat = true
      state.creatingDirectChatUserId = action.meta.arg.otherUserId
      state.createChatError = null
      state.lastCreatedChatId = null

      const pendingUser = action.meta.arg.otherUser
      if (!pendingUser) return

      const existingChat = state.chats.find((chat) => chat.participantId === pendingUser.id)
      if (existingChat) return

      upsertDirectChat(state, {
        id: `pending-${pendingUser.id}`,
        participantId: pendingUser.id,
        participantName: pendingUser.name,
        participantUsername: pendingUser.username,
        participantAvatar: pendingUser.avatar || undefined,
        participantEmail: pendingUser.email,
        unreadCount: 0,
        messages: [],
        isOnline: false,
        isViewing: false,
        isRequest: false,
        isGroup: false,
        status: "pending",
        lastMessageAt: new Date().toISOString(),
      })
    })
    .addCase(createDirectChatThunk.fulfilled, (state, action) => {
      state.isCreatingDirectChat = false
      state.creatingDirectChatUserId = null
      state.createChatError = null

      const pendingUser = action.payload.otherUser
      const existingChatIndex = state.chats.findIndex(
        (chat) =>
          chat.id === action.payload.chatId ||
          (pendingUser ? chat.participantId === pendingUser.id : false),
      )

      if (existingChatIndex >= 0) {
        const existingChat = state.chats[existingChatIndex]
        state.chats[existingChatIndex] = {
          ...existingChat,
          id: action.payload.chatId,
          status: action.payload.status,
          isRequest: false,
          isGroup: false,
          lastMessageAt: action.payload.updatedAt || action.payload.createdAt,
        }
        state.chats = state.chats.sort((a, b) => getChatSortTime(b) - getChatSortTime(a))
      } else if (pendingUser) {
        upsertDirectChat(state, {
          id: action.payload.chatId,
          participantId: pendingUser.id,
          participantName: pendingUser.name,
          participantUsername: pendingUser.username,
          participantAvatar: pendingUser.avatar || undefined,
          participantEmail: pendingUser.email,
          unreadCount: 0,
          messages: [],
          isOnline: false,
          isViewing: false,
          isRequest: false,
          isGroup: false,
          status: action.payload.status,
          lastMessageAt: action.payload.updatedAt || action.payload.createdAt,
        })
      }

      state.lastCreatedChatId = action.payload.chatId
    })
    .addCase(createDirectChatThunk.rejected, (state, action) => {
      state.isCreatingDirectChat = false
      state.creatingDirectChatUserId = null
      state.createChatError = action.payload as string
      state.lastCreatedChatId = null

      const pendingUserId = action.meta.arg.otherUser?.id
      if (!pendingUserId) return

      state.chats = state.chats.filter((chat) => chat.id !== `pending-${pendingUserId}`)
    })

    // ── fetchDirectChats ──────────────────────────────────────
    .addCase(fetchDirectChatsThunk.pending, (state) => {
      state.isLoadingChats = true
      state.chatsError = null
    })
    .addCase(fetchDirectChatsThunk.fulfilled, (state, action) => {
      state.isLoadingChats = false
      state.chatsError = null
      state.hasLoadedDirectChats = true

      const existingById = new Map(state.chats.map((chat) => [chat.id, chat]))
      const preservedChats = state.chats.filter((chat) => chat.isRequest || chat.isGroup)

      const mappedDirectChats = action.payload.map((chat) => {
        const existing = existingById.get(chat.chatId)
        return {
          id: chat.chatId,
          participantId: chat.otherUser._id,
          participantName: chat.otherUser.name,
          participantUsername: chat.otherUser.username,
          participantAvatar: chat.otherUser.avatar || undefined,
          participantEmail: existing?.participantEmail || chat.otherUser.email,
          unreadCount: chat.unreadCount,
          isOnline: existing?.isOnline ?? false,
          isViewing: existing?.isViewing ?? false,
          isGroup: false,
          isRequest: false,
          status: chat.status as "pending" | "active" | "blocked",
          messages: existing?.messages ?? [],
          lastMessage: existing?.lastMessage,
          lastMessageAt: existing?.lastMessageAt || chat.updatedAt,
        }
      })

      state.chats = [...preservedChats, ...mappedDirectChats]

      if (state.activeChat) {
        state.activeChat = state.chats.find((chat) => chat.id === state.activeChat?.id) || null
      }
    })
    .addCase(fetchDirectChatsThunk.rejected, (state, action) => {
      state.isLoadingChats = false
      state.chatsError = action.payload as string
    })

    // ── fetchDirectChatRequests ───────────────────────────────
    .addCase(fetchDirectChatRequestsThunk.pending, (state) => {
      state.isLoadingRequests = true
      state.requestsError = null
    })
    .addCase(fetchDirectChatRequestsThunk.fulfilled, (state, action) => {
      state.isLoadingRequests = false
      state.requestsError = null
      state.hasLoadedDirectRequests = true

      const nonRequestChats = state.chats.filter((chat) => !chat.isRequest)

      const requestChats = action.payload.map((request) => {
        const existing = state.chats.find((chat) => chat.id === request._id)
        return {
          id: request._id,
          participantId: request.sender._id,
          participantName: request.sender.name,
          participantUsername: request.sender.username,
          participantAvatar: request.sender.avatar || undefined,
          participantEmail: request.sender.email,
          participantPhoneNumber: request.sender.phoneNumber,
          participantPhoneVisibility: request.sender.phoneVisibility,
          participantLastSeen: request.sender.lastSeen,
          participantTimezone: request.sender.timezone,
          unreadCount: 0,
          isOnline: existing?.isOnline ?? false,
          isViewing: existing?.isViewing ?? false,
          isGroup: false,
          isRequest: true,
          status: "pending" as const,
          messages: existing?.messages ?? [],
          lastMessage: existing?.lastMessage,
          lastMessageAt: existing?.lastMessageAt || request.createdAt,
        }
      })

      state.chats = [...nonRequestChats, ...requestChats]

      if (state.activeChat?.isRequest) {
        state.activeChat = state.chats.find((chat) => chat.id === state.activeChat?.id) || null
      }
    })
    .addCase(fetchDirectChatRequestsThunk.rejected, (state, action) => {
      state.isLoadingRequests = false
      state.requestsError = action.payload as string
    })

    // ── respondDirectChatRequest ──────────────────────────────
    .addCase(respondDirectChatRequestThunk.pending, (state, action) => {
      state.isRespondingToRequestByChatId[action.meta.arg.chatId] = true
      state.respondRequestErrorByChatId[action.meta.arg.chatId] = null
    })
    .addCase(respondDirectChatRequestThunk.fulfilled, (state, action) => {
      const { chatId, action: requestAction, chat } = action.payload
      state.isRespondingToRequestByChatId[chatId] = false
      state.respondRequestErrorByChatId[chatId] = null

      if (requestAction === "reject") {
        state.chats = state.chats.filter((item) => item.id !== chatId)
        if (state.activeChat?.id === chatId) state.activeChat = null
        return
      }

      const otherUser = chat.otherUser
      const existing = state.chats.find((item) => item.id === chatId)

      if (!otherUser) {
        state.chats = state.chats.map((item) =>
          item.id === chatId ? { ...item, isRequest: false } : item,
        )
        if (state.activeChat?.id === chatId) {
          state.activeChat = state.chats.find((item) => item.id === chatId) || null
        }
        return
      }

      const acceptedChat = {
        id: chat._id,
        participantId: otherUser._id,
        participantName: otherUser.name,
        participantUsername: otherUser.username,
        participantAvatar: otherUser.avatar || undefined,
        participantEmail: otherUser.email,
        participantPhoneNumber: otherUser.phoneNumber,
        participantPhoneVisibility: otherUser.phoneVisibility,
        participantLastSeen: otherUser.lastSeen,
        participantTimezone: otherUser.timezone,
        unreadCount: existing?.unreadCount ?? 0,
        isOnline: existing?.isOnline ?? false,
        isViewing: existing?.isViewing ?? false,
        isGroup: false,
        isRequest: false,
        messages: existing?.messages ?? [],
        lastMessage: existing?.lastMessage,
        lastMessageAt: existing?.lastMessageAt || chat.updatedAt,
      }

      state.chats = [...state.chats.filter((item) => item.id !== chatId), acceptedChat]
      if (state.activeChat?.id === chatId) state.activeChat = acceptedChat
    })
    .addCase(respondDirectChatRequestThunk.rejected, (state, action) => {
      const chatId = action.meta.arg.chatId
      state.isRespondingToRequestByChatId[chatId] = false
      state.respondRequestErrorByChatId[chatId] = action.payload as string
    })

    // ── fetchDirectMessages ───────────────────────────────────
    .addCase(fetchDirectMessagesThunk.pending, (state, action) => {
      state.isLoadingMessagesByChatId[action.meta.arg.chatId] = true
      state.messagesErrorByChatId[action.meta.arg.chatId] = null
    })
    .addCase(fetchDirectMessagesThunk.fulfilled, (state, action) => {
      const { chatId, messages, currentUserId } = action.payload
      state.isLoadingMessagesByChatId[chatId] = false
      state.loadedMessagesByChatId[chatId] = true
      state.messagesErrorByChatId[chatId] = null

      const mappedMessages: Message[] = messages.map((message) =>
        mapApiMessageToMessage(message, currentUserId),
      )
      const lastMessage = mappedMessages[mappedMessages.length - 1]
      const lastMessageAt = getLatestMessageCreatedAt(messages)

      state.chats = state.chats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: mappedMessages,
              lastMessage: lastMessage || chat.lastMessage,
              lastMessageAt: lastMessageAt || chat.lastMessageAt,
            }
          : chat,
      )

      if (state.activeChat?.id === chatId) {
        state.activeChat = {
          ...state.activeChat,
          messages: mappedMessages,
          lastMessage: lastMessage || state.activeChat.lastMessage,
          lastMessageAt: lastMessageAt || state.activeChat.lastMessageAt,
        }
      }
    })
    .addCase(fetchDirectMessagesThunk.rejected, (state, action) => {
      const chatId = action.meta.arg.chatId
      state.isLoadingMessagesByChatId[chatId] = false
      state.messagesErrorByChatId[chatId] = action.payload as string
    })

    // ── sendDirectMessage ─────────────────────────────────────
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
        chat.id === chatId
          ? {
              ...chat,
              messages: [...chat.messages, mappedMessage],
              lastMessage: mappedMessage,
              lastMessageAt: message.createdAt,
            }
          : chat,
      )

      if (state.activeChat?.id === chatId) {
        state.activeChat = {
          ...state.activeChat,
          messages: [...state.activeChat.messages, mappedMessage],
          lastMessage: mappedMessage,
          lastMessageAt: message.createdAt,
        }
      }

      state.unlockedMessageId = mappedMessage.id
    })
}