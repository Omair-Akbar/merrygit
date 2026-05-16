// ─────────────────────────────────────────────────────────────
// group-chat-slice.ts
// Thunks and extra-reducer handlers for group chats.
// ─────────────────────────────────────────────────────────────

import { createAsyncThunk } from "@reduxjs/toolkit"
import type { ActionReducerMapBuilder } from "@reduxjs/toolkit"

import { getGroupMessages, sendGroupMessage } from "@/lib/api/chat-api"
import type { RootState } from "@/lib/store/store"
import type { ChatState, Message } from "./chat-types"
import { mapApiMessageToMessage } from "./chat-types"

// ── Thunks ────────────────────────────────────────────────────

export const fetchGroupMessagesThunk = createAsyncThunk(
  "chat/fetchGroupMessages",
  async ({ groupId }: { groupId: string }, { rejectWithValue, getState }) => {
    try {
      const response = await getGroupMessages(groupId)
      const state = getState() as RootState
      const currentUserId = state.auth.user?._id || null
      return { groupId, messages: response.data.messages, currentUserId }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch messages")
    }
  },
)

export const sendGroupMessageThunk = createAsyncThunk(
  "chat/sendGroupMessage",
  async (
    { groupId, text, replyTo }: { groupId: string; text: string; replyTo?: string | null },
    { rejectWithValue, getState },
  ) => {
    try {
      const response = await sendGroupMessage({
        chatId: groupId,
        text,
        messageType: "text",
        chatType: "group",
        replyTo: replyTo ?? null,
      })
      const state = getState() as RootState
      const currentUserId = state.auth.user?._id || null
      return { groupId, message: response.data, currentUserId }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to send message")
    }
  },
)

// ── Extra-reducer handlers (called from the main slice) ───────

export const addGroupChatReducers = (builder: ActionReducerMapBuilder<ChatState>) => {
  builder
    // ── fetchGroupMessages ────────────────────────────────────
    .addCase(fetchGroupMessagesThunk.pending, (state, action) => {
      state.isLoadingGroupMessagesByChatId[action.meta.arg.groupId] = true
      state.groupMessagesErrorByChatId[action.meta.arg.groupId] = null
    })
    .addCase(fetchGroupMessagesThunk.fulfilled, (state, action) => {
      const { groupId, messages, currentUserId } = action.payload
      state.isLoadingGroupMessagesByChatId[groupId] = false
      state.loadedGroupMessagesByChatId[groupId] = true
      state.groupMessagesErrorByChatId[groupId] = null

      const mappedMessages: Message[] = messages.map((message) =>
        mapApiMessageToMessage(message, currentUserId),
      )
      const lastMessage = mappedMessages[mappedMessages.length - 1]
      const lastMessageAt = messages[messages.length - 1]?.createdAt || null

      state.groupMessagesByChatId[groupId] = mappedMessages
      state.groupLastMessageAtByChatId[groupId] = lastMessageAt

      if (state.activeChat?.id === groupId && state.activeChat.isGroup) {
        state.activeChat = {
          ...state.activeChat,
          messages: mappedMessages,
          lastMessage: lastMessage || state.activeChat.lastMessage,
          lastMessageAt: lastMessageAt || state.activeChat.lastMessageAt,
        }
      }
    })
    .addCase(fetchGroupMessagesThunk.rejected, (state, action) => {
      const groupId = action.meta.arg.groupId
      state.isLoadingGroupMessagesByChatId[groupId] = false
      state.groupMessagesErrorByChatId[groupId] = action.payload as string
    })

    // ── sendGroupMessage ──────────────────────────────────────
    .addCase(sendGroupMessageThunk.fulfilled, (state, action) => {
      const { groupId, message, currentUserId } = action.payload
      const mappedMessage: Message = mapApiMessageToMessage(message, currentUserId)

      state.groupMessagesByChatId[groupId] = [
        ...(state.groupMessagesByChatId[groupId] || []),
        mappedMessage,
      ]
      state.groupLastMessageAtByChatId[groupId] = message.createdAt

      if (state.activeChat?.id === groupId && state.activeChat.isGroup) {
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