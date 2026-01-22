import { io, type Socket } from "socket.io-client"

// Socket event types for type safety
export interface ServerToClientEvents {
  "message:receive": (data: { chatId: string; message: unknown }) => void
  "typing:start": (data: { chatId: string; userId: string }) => void
  "typing:stop": (data: { chatId: string; userId: string }) => void
  "user:online": (data: { userId: string }) => void
  "user:offline": (data: { userId: string }) => void
  "user:viewing": (data: { userId: string; chatId: string }) => void
  "user:not-viewing": (data: { userId: string; chatId: string }) => void
  "chat:updated": (data: { chatId: string }) => void
  error: (data: { message: string }) => void
}

export interface ClientToServerEvents {
  "message:send": (data: { chatId: string; message: unknown }) => void
  "typing:start": (data: { chatId: string }) => void
  "typing:stop": (data: { chatId: string }) => void
  "chat:join": (data: { chatId: string }) => void
  "chat:leave": (data: { chatId: string }) => void
  "message:read": (data: { chatId: string; messageId: string }) => void
  "chat:viewing": (data: { chatId: string }) => void
  "chat:not-viewing": (data: { chatId: string }) => void
}

class SocketClient {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null
  private url: string = process.env.NEXT_PUBLIC_SOCKET_URL || "https://merrygit-chat-service.onrender.com/"
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect(token: string): Socket<ServerToClientEvents, ClientToServerEvents> | null {
    if (this.socket?.connected) return this.socket

    this.socket = io(this.url, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    })

    this.socket.on("connect", () => {
      console.log("[Socket] Connected successfully")
      this.reconnectAttempts = 0
    })

    this.socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason)
    })

    this.socket.on("connect_error", (error) => {
      console.error("[Socket] Connection error:", error.message)
      this.reconnectAttempts++

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("[Socket] Max reconnection attempts reached")
      }
    })

    this.socket.on("error", (data) => {
      console.error("[Socket] Error:", data.message)
    })

    return this.socket
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
      this.reconnectAttempts = 0
      console.log("[Socket] Disconnected and cleaned up")
    }
  }

  emit<T extends keyof ClientToServerEvents>(event: T, data: Parameters<ClientToServerEvents[T]>[0]): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    } else {
      console.warn("[Socket] Cannot emit, not connected")
    }
  }

  on<T extends keyof ServerToClientEvents>(event: T, callback: ServerToClientEvents[T]): void {
    if (this.socket) {
      this.socket.on(event, callback as never)
    }
  }

  off<T extends keyof ServerToClientEvents>(event: T, callback?: ServerToClientEvents[T]): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback as never)
      } else {
        this.socket.off(event)
      }
    }
  }

  getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
    return this.socket
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  getConnectionState(): "connected" | "connecting" | "disconnected" {
    if (!this.socket) return "disconnected"
    if (this.socket.connected) return "connected"
    return "connecting"
  }
}

// Singleton instance
export const socketClient = new SocketClient()
