"use client"

import { useEffect, useCallback, useState } from "react"
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
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user) return

    const socket = socketClient.connect(user.id)

    if (socket) {
      socket.on("connect", () => {
        setIsConnected(true)
        options.onConnect?.()
      })

      socket.on("disconnect", () => {
        setIsConnected(false)
        options.onDisconnect?.()
      })

      socket.on("connect_error", (error) => {
        options.onError?.(error)
      })

      socket.on("message:receive", (data: { chatId: string; message: Message }) => {
        dispatch(addMessage(data))
      })

      socket.on("typing:start", () => {
        dispatch(setTyping(true))
      })

      socket.on("typing:stop", () => {
        dispatch(setTyping(false))
      })

      socket.on("user:online", (data: { userId: string }) => {
        dispatch(setUserOnline({ userId: data.userId, isOnline: true }))
      })

      socket.on("user:offline", (data: { userId: string }) => {
        dispatch(setUserOnline({ userId: data.userId, isOnline: false }))
      })

      socket.on("user:viewing", (data: { userId: string }) => {
        dispatch(setUserViewing({ userId: data.userId, isViewing: true }))
      })

      socket.on("user:not-viewing", (data: { userId: string }) => {
        dispatch(setUserViewing({ userId: data.userId, isViewing: false }))
      })
    }

    return () => {
      socketClient.disconnect()
    }
  }, [isAuthenticated, user, dispatch, options])

  const sendMessage = useCallback((chatId: string, message: Omit<Message, "id" | "timestamp">) => {
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

  return {
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    joinChat,
    leaveChat,
    setViewingChat,
    setNotViewingChat,
  }
}
