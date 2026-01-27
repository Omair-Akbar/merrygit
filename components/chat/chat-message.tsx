"use client"

import { motion } from "framer-motion"
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Message } from "@/lib/store/slices/chat-slice"

interface ChatMessageProps {
  message: Message
  isUnlocked: boolean
  lockDisplayMode: "text" | "icon" | "custom"
  customLockText: string
  onMessageClick: (messageId: string) => void
}

export function ChatMessage({
  message,
  isUnlocked,
  lockDisplayMode,
  customLockText,
  onMessageClick,
}: ChatMessageProps) {
  const isMe = message.senderId === "me"

  const renderLockedContent = () => {
    switch (lockDisplayMode) {
      case "icon":
        return <Lock className="h-4 w-4 opacity-60" />
      case "custom":
        return <span className="italic opacity-60">{customLockText}</span>
      default:
        return (
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3 opacity-60" />
            <span className="italic opacity-60">Locked</span>
          </span>
        )
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex", isMe ? "justify-end" : "justify-start")}
    >
      <motion.div
        onClick={() => onMessageClick(message.id)}
        // whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          "max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-2 cursor-pointer transition-all",
          isMe
            ? "bg-message-sent text-message-sent-foreground rounded-br-sm"
            : "bg-message-received text-message-received-foreground rounded-bl-sm",
        )}
      >
        {isUnlocked ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-sm">{message.content}</p>
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {message.attachments.map((attachment, index) => (
                  <img
                    key={index}
                    src={attachment || "/placeholder.svg"}
                    alt={`Attachment ${index + 1}`}
                    className="max-w-50 rounded-lg"
                  />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm">
            {renderLockedContent()}
          </motion.div>
        )}
        <p className={cn("text-xs mt-1", isUnlocked ? "opacity-60" : "opacity-40")}>{message.timestamp}</p>
      </motion.div>
    </motion.div>
  )
}
