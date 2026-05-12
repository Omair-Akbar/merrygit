import axios from "axios"

const CHAT_API_BASE_URL =
  process.env.NEXT_PUBLIC_CHAT_API_BASE_URL || "http://localhost:5002/api/v1/chat"

const chatApiInstance = axios.create({
  baseURL: CHAT_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

export interface DirectChatResponse {
  message: string
  chat: {
    _id: string
    participants: string[]
    createdBy: string
    status: string
    blockedBy: string | null
    createdAt: string
    updatedAt: string
    __v: number
  }
}

export interface DirectChatsResponse {
  message: string
  data: {
    chats: Array<{
      chatId: string
      status: string
      createdAt: string
      updatedAt: string
      unreadCount: number
      otherUser: {
        _id: string
        name: string
        username: string
        email: string
        avatar: string | null
        createdAt: string
      }
    }>
    totalCount: number
    totalUnread: number
  }
}

export interface DirectMessagesResponse {
  message: string
  data: {
    messages: Array<{
      _id: string
      chatType: "direct"
      directChatId: string
      senderId: string
      text: string
      messageType: string
      seenBy: string[]
      replyTo: string | null
      reactions: unknown[]
      createdAt: string
      sender?: {
        _id: string
        name: string
        email: string
        username: string
        avatar: string | null
      }
    }>
    chatType: "direct"
    pagination: {
      currentPage: number
      totalPages: number
      totalCount: number
      itemsPerPage: number
      hasNextPage: boolean
      hasPrevPage: boolean
      nextPage: number | null
      prevPage: number | null
    }
  }
}

export interface GroupMessagesResponse {
  message: string
  data: {
    messages: Array<{
      _id: string
      chatType: "group"
      groupChatId: string
      senderId: string
      text: string
      messageType: string
      seenBy: string[]
      replyTo: string | null
      reactions: unknown[]
      createdAt: string
      sender?: {
        _id: string
        name: string
        email: string
        username: string
        avatar: string | null
      }
    }>
    chatType: "group"
    pagination: {
      currentPage: number
      totalPages: number
      totalCount: number
      itemsPerPage: number
      hasNextPage: boolean
      hasPrevPage: boolean
      nextPage: number | null
      prevPage: number | null
    }
  }
}

export interface DirectChatRequestsResponse {
  message: string
  data: {
    requests: Array<{
      _id: string
      sender: {
        _id: string
        name: string
        username: string
        email: string
        phoneNumber: string
        phoneVisibility: string
        avatar: string | null
        lastSeen: string
        timezone: string
        createdAt: string
        updatedAt: string
      }
      createdAt: string
    }>
    totalCount: number
  }
}

export interface RespondDirectChatInvitationResponse {
  message: string
  chat: {
    _id: string
    status: string
    createdAt?: string
    updatedAt: string
    participants?: string[]
    otherUser?: {
      _id: string
      name: string
      username: string
      email: string
      phoneNumber: string
      phoneVisibility: string
      avatar: string | null
      lastSeen: string
      timezone: string
      createdAt: string
      updatedAt: string
    }
  }
}

export interface SendDirectMessageRequest {
  chatId: string
  text: string
  messageType: "text"
  chatType: "direct"
  replyTo?: string | null
}

export interface SendGroupMessageRequest {
  chatId: string
  text: string
  messageType: "text"
  chatType: "group"
  replyTo?: string | null
}

export interface SendDirectMessageResponse {
  message: string
  data: {
    _id: string
    chatType: "direct"
    directChatId: string
    senderId: string
    text: string
    messageType: string
    seenBy: string[]
    replyTo: string | null
    isDeleted: boolean
    reactions: unknown[]
    createdAt: string
    updatedAt: string
    sender?: {
      _id: string
      name: string
      email: string
      username: string
      avatar: string | null
    }
  }
}

export interface SendGroupMessageResponse {
  message: string
  data: {
    _id: string
    chatType: "group"
    groupChatId: string
    senderId: string
    text: string
    messageType: string
    seenBy: string[]
    replyTo: string | null
    isDeleted: boolean
    reactions: unknown[]
    createdAt: string
    updatedAt: string
    sender?: {
      _id: string
      name: string
      email: string
      username: string
      avatar: string | null
    }
  }
}

export const createDirectChat = async (otherUserId: string): Promise<DirectChatResponse> => {
  const response = await chatApiInstance.post<DirectChatResponse>("/direct", { otherUserId })
  return response.data
}

export const getDirectChats = async (): Promise<DirectChatsResponse> => {
  const response = await chatApiInstance.get<DirectChatsResponse>("/direct")
  return response.data
}

export const getDirectMessages = async (chatId: string): Promise<DirectMessagesResponse> => {
  const response = await chatApiInstance.get<DirectMessagesResponse>(`/direct/${chatId}/messages`)
  return response.data
}

export const getGroupMessages = async (groupId: string): Promise<GroupMessagesResponse> => {
  const response = await chatApiInstance.get<GroupMessagesResponse>(`/group/${groupId}/messages`)
  return response.data
}

export const getDirectChatRequests = async (): Promise<DirectChatRequestsResponse> => {
  const response = await chatApiInstance.get<DirectChatRequestsResponse>("/direct/requests")
  return response.data
}

export const respondDirectChatInvitation = async (
  chatId: string,
  action: "accept" | "reject",
): Promise<RespondDirectChatInvitationResponse> => {
  const response = await chatApiInstance.post<RespondDirectChatInvitationResponse>(
    `/direct/${chatId}/invitation`,
    { action },
  )
  return response.data
}

export const sendDirectMessage = async (
  payload: SendDirectMessageRequest,
): Promise<SendDirectMessageResponse> => {
  const response = await chatApiInstance.post<SendDirectMessageResponse>("/messages", payload)
  return response.data
}

export const sendGroupMessage = async (
  payload: SendGroupMessageRequest,
): Promise<SendGroupMessageResponse> => {
  const response = await chatApiInstance.post<SendGroupMessageResponse>("/messages", payload)
  return response.data
}
