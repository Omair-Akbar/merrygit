"use client"

import { useEffect, useCallback, useState, useRef } from "react"
import { socketClient } from "@/lib/socket"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { addMessage, setTyping, setUserOnline, setUserViewing, type Message } from "@/lib/store/slices/chat-slice"

interface UseSocketOptions {
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
}

export function useSocket(options: UseSocketOptions = {}) {
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const [isConnected, setIsConnected] = useState(() => {
    return socketClient.getSocket()?.connected ?? false
  })

  // Stabilize callbacks in a ref so they never cause re-runs of the effect
  const optionsRef = useRef(options)
  useEffect(() => {
    optionsRef.current = options
  })

  useEffect(() => {
    if (!isAuthenticated || !user) return

    console.log("[useSocket] Connecting with user ID:", user._id)
    const socket = socketClient.getSocket() ?? socketClient.connect(user._id)

    if (socket) {
      const handleConnect = () => {
        setIsConnected(true)
        socket.emit("get:online-users")
        socket.emit("get:viewing-users")
        optionsRef.current.onConnect?.()
      }

      const handleDisconnect = () => {
        setIsConnected(false)
        optionsRef.current.onDisconnect?.()
      }

      const handleConnectError = (error: Error) => {
        optionsRef.current.onError?.(error)
      }

      const handleMessageReceive = (data: { chatId: string; message: unknown }) => {
        // Server sends raw API shape; map it to our Message type
        const raw = data.message as Record<string, unknown>
        const formatTime = (iso: string) =>
          new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        const formatDay = (iso: string) =>
          new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })

        const mapped: Message = {
          id: (raw._id as string) ?? (raw.id as string) ?? "",
          content: (raw.text as string) ?? (raw.content as string) ?? "",
          senderId: (raw.senderId as string) ?? "",
          senderName: (raw.sender as Record<string, string>)?.name ?? (raw.senderName as string),
          senderAvatar: (raw.sender as Record<string, string>)?.avatar ?? (raw.senderAvatar as string),
          receiverId: (raw.receiverId as string) ?? "",
          timestamp: raw.createdAt ? formatTime(raw.createdAt as string) : (raw.timestamp as string) ?? "",
          dayLabel: raw.createdAt ? formatDay(raw.createdAt as string) : (raw.dayLabel as string),
          isEncrypted: (raw.isEncrypted as boolean) ?? true,
          isRead: false,
          attachments: (raw.attachments as string[]) ?? undefined,
        }
        dispatch(addMessage({ chatId: data.chatId, message: mapped }))
      }

      const handleTypingStart = (data: { chatId: string; userId: string }) => {
        dispatch(setTyping({ chatId: data.chatId, isTyping: true }))
      }

      const handleTypingStop = (data: { chatId: string; userId: string }) => {
        dispatch(setTyping({ chatId: data.chatId, isTyping: false }))
      }

      const handleUserOnline = (data: { userId: string }) => {
        dispatch(setUserOnline({ userId: data.userId, isOnline: true }))
      }

      const handleUserOffline = (data: { userId: string }) => {
        dispatch(setUserOnline({ userId: data.userId, isOnline: false }))
      }

      // const handleUserViewing = (data: { userId: string; chatId: string }) => {
      //   dispatch(setUserViewing({ userId: data.userId, isViewing: true }))
      // }

      // const handleUserNotViewing = (data: { userId: string; chatId: string }) => {
      //   dispatch(setUserViewing({ userId: data.userId, isViewing: false }))
      // }

      socket.on("connect", handleConnect)
      socket.on("disconnect", handleDisconnect)
      socket.on("connect_error", handleConnectError)
      socket.on("message:receive", handleMessageReceive)
      socket.on("typing:start", handleTypingStart)
      socket.on("typing:stop", handleTypingStop)
      socket.on("user:online", handleUserOnline)
      socket.on("user:offline", handleUserOffline)
      // socket.on("user:viewing", handleUserViewing)
      // socket.on("user:not-viewing", handleUserNotViewing)

      return () => {
        const s = socketClient.getSocket()
        if (s) {
          s.off("connect", handleConnect)
          s.off("disconnect", handleDisconnect)
          s.off("connect_error", handleConnectError)
          s.off("message:receive", handleMessageReceive)
          s.off("typing:start", handleTypingStart)
          s.off("typing:stop", handleTypingStop)
          s.off("user:online", handleUserOnline)
          s.off("user:offline", handleUserOffline)
          // s.off("user:viewing", handleUserViewing)
          // s.off("user:not-viewing", handleUserNotViewing)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, dispatch])

  const sendMessage = useCallback((chatId: string, message: Omit<Message, "id" | "timestamp">) => {
    console.log("[Socket Sender] 📴 Sending message to chat:", chatId)
    socketClient.emit("message:send", { chatId, message })
  }, [])

  const startTyping = useCallback((chatId: string) => {
    socketClient.emit("typing:start", { chatId })
  }, [])

  const stopTyping = useCallback((chatId: string) => {
    socketClient.emit("typing:stop", { chatId })
  }, [])

  const joinChat = useCallback((chatId: string) => {
    socketClient.emit("chat:join", { chatId })
  }, [])

  const leaveChat = useCallback((chatId: string) => {
    socketClient.emit("chat:leave", { chatId })
  }, [])

  const setViewingChat = useCallback((chatId: string) => {
    socketClient.emit("chat:viewing", { chatId })
  }, [])

  const setNotViewingChat = useCallback((chatId: string) => {
    socketClient.emit("chat:not-viewing", { chatId })
  }, [])

  const markMessageRead = useCallback((chatId: string, messageId: string) => {
    socketClient.emit("message:read", { chatId, messageId })
  }, [])

  return {
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    joinChat,
    leaveChat,
    setViewingChat,
    setNotViewingChat,
    markMessageRead,
  }
}
