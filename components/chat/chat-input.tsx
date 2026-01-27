"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, ImageIcon, Smile, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { EmojiPicker } from "./emoji-picker"

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: File[]) => void
  disabled?: boolean
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [showEmoji, setShowEmoji] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emojiButtonRef = useRef<HTMLButtonElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showEmoji &&
        emojiPickerRef.current &&
        emojiButtonRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmoji(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showEmoji])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() && attachments.length === 0) return

    onSendMessage(message, attachments.length > 0 ? attachments : undefined)
    setMessage("")
    setAttachments([])
    setPreviewUrls([])
    setShowEmoji(false)
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter, new line on Shift+Enter
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Filter for images only
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))

    setAttachments((prev) => [...prev, ...imageFiles])

    // Create preview URLs
    const newPreviewUrls = imageFiles.map((file) => URL.createObjectURL(file))
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls])

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeAttachment = (index: number) => {
    URL.revokeObjectURL(previewUrls[index])
    setAttachments((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleEmojiClick = (emoji: string) => {
    setMessage((prev) => prev + emoji)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  return (
    <div className="border-t border-border">
      {/* Attachment preview */}
      <AnimatePresence>
        {previewUrls.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pt-3 overflow-hidden"
          >
            <div className="flex gap-2 overflow-x-auto pb-2">
              {previewUrls.map((url, index) => (
                <motion.div
                  key={url}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative shrink-0"
                >
                  <img
                    src={url || "/placeholder.svg"}
                    alt={`Attachment ${index + 1}`}
                    className="h-16 w-16 object-cover rounded-lg border border-border"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji picker */}
      <div ref={emojiPickerRef}>
        <EmojiPicker isOpen={showEmoji} onEmojiSelect={handleEmojiClick} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-4 flex items-end gap-2">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Attachment button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          // disabled={disabled}
          className="shrink-0"
        >
          <ImageIcon className="h-10 w-10" />
        </Button>

        {/* Emoji button */}
        <Button
          ref={emojiButtonRef}
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShowEmoji(!showEmoji)}
          // disabled={disabled}
          className={cn("shrink-0", showEmoji && "bg-accent")}
        >
          <Smile className="h-10 w-10" />
        </Button>

        {/* Message input */}
        <textarea
          ref={textareaRef}
          placeholder="Type a message..."
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-accent dark:bg-accent rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 max-h-32 overflow-y-auto"
        />

        {/* Send button */}
        <Button
          type="submit"
          size="icon"
          disabled={disabled || (!message.trim() && attachments.length === 0)}
          className="shrink-0 bg-secondary text-secondary-foreground hover:bg-accent"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
