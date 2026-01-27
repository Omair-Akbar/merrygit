"use client"

import { motion, AnimatePresence } from "framer-motion"

// Common emoji list
const EMOJI_LIST = [
//   "😀",
//   "😃",
//   "😄",
//   "😁",
//   "😅",
//   "😂",
//   "🤣",
//   "😊",
//   "😇",
//   "🙂",
//   "😉",
//   "😌",
//   "😍",
//   "🥰",
//   "😘",
//   "😋",
//   "😛",
//   "😜",
//   "🤪",
//   "😝",
//   "🤗",
//   "🤭",
//   "🤫",
//   "🤔",
//   "🤐",
//   "🤨",
//   "😐",
//   "😑",
//   "😶",
//   "😏",
//   "😒",
//   "🙄",
//   "😬",
//   "😮",
//   "😯",
//   "😲",
//   "😳",
//   "🥺",
//   "😢",
//   "😭",
//   "😤",
//   "😠",
//   "😡",
//   "🤬",
//   "😈",
  "👿",
  "💀",
  "☠️",
  "💩",
  "🤡",
  "👍",
  "👎",
  "👏",
  "🙌",
  "🤝",
//   "❤️",
//   "🧡",
//   "💛",
//   "💚",
//   "💙",
]

interface EmojiPickerProps {
  isOpen: boolean
  onEmojiSelect: (emoji: string) => void
}

export function EmojiPicker({ isOpen, onEmojiSelect }: EmojiPickerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 pt-3 overflow-hidden"
        >
          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <div className="grid grid-cols-10 gap-1 max-h-32 overflow-y-auto">
              {EMOJI_LIST.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onEmojiSelect(emoji)}
                  className="p-1.5 hover:bg-accent rounded text-lg transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
