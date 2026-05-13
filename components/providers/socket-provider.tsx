"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { socketClient } from "@/lib/socket"
import { useAppSelector } from "@/lib/store/hooks"

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
  const [isConnected, setIsConnected] = useState(false)
  const [connectionState, setConnectionState] = useState<"connected" | "connecting" | "disconnected">("disconnected")

  useEffect(() => {
    if (!isAuthenticated || !user) {
      socketClient.disconnect()
      setIsConnected(false)
      setConnectionState("disconnected")
      return
    }

    setConnectionState("connecting")
    const socket = socketClient.connect(user.id)

    if (socket) {
      socket.on("connect", () => {
        setIsConnected(true)
        setConnectionState("connected")
      })

      socket.on("disconnect", () => {
        setIsConnected(false)
        setConnectionState("disconnected")
      })
    }

    return () => {
      socketClient.disconnect()
    }
  }, [isAuthenticated, user])

  return <SocketContext.Provider value={{ isConnected, connectionState }}>{children}</SocketContext.Provider>
}
