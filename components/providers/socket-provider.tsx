"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { socketClient } from "@/lib/socket"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import {
  addMessage,
  setTyping,
  setUserOnline,
  setUserViewing,
  fetchDirectChatsThunk,
  type Message,
} from "@/lib/store/slices/chat-slice"

interface SocketContextValue {
  isConnected: boolean
  connectionState: "connected" | "connecting" | "disconnected"
}

const SocketContext = createContext<SocketContextValue>({
  isConnected: false,
  connectionState: "disconnected",
})

export function useSocketContext() {
  return useContext(SocketContext)
}

interface SocketProviderProps {
  children: ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  // Stable primitive — only changes on login/logout, not on every Redux update
  const userId = user?._id ?? null
  // Stable string to detect new chats without subscribing to entire chat state
  const chatIds = useAppSelector((state) => state.chat.chats.map((c) => c.id).join(","))
  const dispatch = useAppDispatch()
  const [isConnected, setIsConnected] = useState(false)
  const [connectionState, setConnectionState] = useState<"connected" | "connecting" | "disconnected">("disconnected")

  // Keep dispatch stable in a ref so it never causes the effect to re-run
  const dispatchRef = useRef(dispatch)
  dispatchRef.current = dispatch

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      socketClient.disconnect()
      setIsConnected(false)
      setConnectionState("disconnected")
      return
    }

    setConnectionState("connecting")
    const socket = socketClient.connect(userId)
    if (!socket) return

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleConnect = () => {
      console.log("[Socket Provider] ✅ Connected. ID:", socket.id)
      setIsConnected(true)
      setConnectionState("connected")
      socket.emit("get:online-users")
      socket.emit("get:viewing-users")
    }

    const handleDisconnect = (reason: string) => {
      console.log("[Socket Provider] ❌ Disconnected:", reason)
      setIsConnected(false)
      setConnectionState("disconnected")
    }

    const handleMessageReceive = (data: { chatId: string; message: unknown }) => {
      const raw = data.message as Record<string, unknown>
      const fmt = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      const day = (iso: string) => new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })

      const mapped: Message = {
        id: (raw._id as string) ?? (raw.id as string) ?? "",
        content: (raw.text as string) ?? (raw.content as string) ?? "",
        senderId: (raw.senderId as string) ?? "",
        senderName: (raw.sender as Record<string, string>)?.name ?? (raw.senderName as string),
        senderAvatar: (raw.sender as Record<string, string>)?.avatar ?? (raw.senderAvatar as string),
        receiverId: (raw.receiverId as string) ?? "",
        timestamp: raw.createdAt ? fmt(raw.createdAt as string) : (raw.timestamp as string) ?? "",
        dayLabel: raw.createdAt ? day(raw.createdAt as string) : (raw.dayLabel as string),
        isEncrypted: (raw.isEncrypted as boolean) ?? true,
        isRead: false,
        attachments: (raw.attachments as string[]) ?? undefined,
      }
      dispatchRef.current(addMessage({ chatId: data.chatId, message: mapped }))
      dispatchRef.current(fetchDirectChatsThunk())
    }

    const handleTypingStart = (data: { chatId: string; userId: string }) => {
      dispatchRef.current(setTyping({ chatId: data.chatId, isTyping: true }))
    }

    const handleTypingStop = (data: { chatId: string; userId: string }) => {
      dispatchRef.current(setTyping({ chatId: data.chatId, isTyping: false }))
    }

    const handleUserOnline = (data: { userId: string }) => {
      console.log("[Socket Provider] 🟢 user:online →", data.userId)
      dispatchRef.current(setUserOnline({ userId: data.userId, isOnline: true }))
    }

    const handleUserOffline = (data: { userId: string }) => {
      console.log("[Socket Provider] ⚫ user:offline →", data.userId)
      dispatchRef.current(setUserOnline({ userId: data.userId, isOnline: false }))
    }

    // const handleUserViewing = (data: { userId: string; chatId: string }) => {
    //   dispatchRef.current(setUserViewing({ userId: data.userId, isViewing: true }))
    // }

    // const handleUserNotViewing = (data: { userId: string; chatId: string }) => {
    //   dispatchRef.current(setUserViewing({ userId: data.userId, isViewing: false }))
    // }

    // ── Register listeners ───────────────────────────────────────────────────

    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)
    socket.on("message:receive", handleMessageReceive)
    socket.on("typing:start", handleTypingStart)
    socket.on("typing:stop", handleTypingStop)
    socket.on("user:online", handleUserOnline)
    socket.on("user:offline", handleUserOffline)
    // socket.on("user:viewing", handleUserViewing)
    // socket.on("user:not-viewing", handleUserNotViewing)

    // If already connected (React StrictMode double-invoke or hot-reload),
    // the backend already sent its initial online list before these listeners
    // were registered. Request it again so we don't miss presence data.
    if (socket.connected) {
      setIsConnected(true)
      setConnectionState("connected")
      socket.emit("get:online-users")
      socket.emit("get:viewing-users")
    }

    return () => {
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
      socket.off("message:receive", handleMessageReceive)
      socket.off("typing:start", handleTypingStart)
      socket.off("typing:stop", handleTypingStop)
      socket.off("user:online", handleUserOnline)
      socket.off("user:offline", handleUserOffline)
      // socket.off("user:viewing", handleUserViewing)
      // socket.off("user:not-viewing", handleUserNotViewing)
    }
  // userId is a stable primitive — effect only re-runs on login/logout
  }, [isAuthenticated, userId])  // eslint-disable-line react-hooks/exhaustive-deps

  // Join all loaded chat rooms whenever the connection or chat list changes
  useEffect(() => {
    if (!isConnected || !chatIds) return
    const socket = socketClient.getSocket()
    if (!socket) return
    chatIds.split(",").forEach((chatId) => {
      if (chatId) socket.emit("chat:join", { chatId })
    })
  }, [isConnected, chatIds])

  return <SocketContext.Provider value={{ isConnected, connectionState }}>{children}</SocketContext.Provider>
}
