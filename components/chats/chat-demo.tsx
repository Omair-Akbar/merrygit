"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ImageIcon, Lock, Send, Smile } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface DemoMessage {
  id: string
  content: string
  sender: "user" | "other"
  timestamp: string
}

const demoMessages: DemoMessage[] = [
  {
    id: "1",
    content: "The package has been secured. Did you retrieve the microfilm?",
    sender: "other",
    timestamp: "10:30 AM"
  },
  {
    id: "2",
    content: "Affirmative. It's concealed in the dead drop at coordinates 47°36'N 122°20'W.",
    sender: "user",
    timestamp: "10:31 AM"
  },
  {
    id: "3",
    content: "Good. The asset will retrieve at 2300 hours. Operation Nightshade is compromised.",
    sender: "other",
    timestamp: "10:32 AM"
  },
  {
    id: "4",
    content: "Understood. I've activated Protocol Phoenix. My cover remains intact.",
    sender: "user",
    timestamp: "10:33 AM"
  },
  {
    id: "5",
    content: "Watch for double agent codename 'Raven'. Extraction scheduled for dawn.",
    sender: "other",
    timestamp: "10:34 AM"
  },
  // { 
  //   id: "6", 
  //   content: "The encryption on this channel held. Headquarters confirms no intercepts.", 
  //   sender: "user", 
  //   timestamp: "10:35 AM",
  // },
]

export function ChatDemo() {
  const [unlockedId, setUnlockedId] = useState<string | null>("5")

  const handleMessageClick = (id: string) => {
    setUnlockedId(id)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative rounded-2xl border border-white/10 bg-transparent group p-[1px] overflow-hidden shadow-2xl"
      >
        {/* Continuous Border Beam Animation */}
        {/* <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-2xl">
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              width: "200%",
              height: "200%",
              left: "-50%",
              top: "-50%",
            }}
            className="absolute bg-[conic-gradient(from_0deg,transparent_0deg,transparent_280deg,rgba(168,85,247,0.9)_320deg,rgba(59,130,246,0.9)_360deg)]"
          />
        </div> */}

        {/* Inner Content Container to clip the beam and show glass background */}
        <div className="relative z-10  backdrop-blur-xs rounded-[calc(1rem-1px)] overflow-hidden">
          {/* Chat header */}
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="https://avatars.githubusercontent.com/u/159688251?v=4" alt="@MerryGit" />
              <AvatarFallback>MG</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">Musa</p>
              <div className="flex items-center w-max justify-center pt-1 gap-2">
                <p className="text-xs text-muted-foreground/60">Active in chat</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-4 w-4" />
            </div>
          </div>

          {/* Messages */}
          <div className="p-4 space-y-3 h-98 overflow-y-auto bg-transparent">
            {/* ... remaining content ... */}
            <AnimatePresence mode="popLayout">
              {demoMessages.map((message) => {
                const isUnlocked = unlockedId === message.id
                const isUser = message.sender === "user"

                return (
                  <motion.div
                    key={message.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex", isUser ? "justify-end" : "justify-start")}
                  >
                    <motion.div
                      onClick={() => handleMessageClick(message.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2 cursor-pointer transition-all backdrop-blur-sm",
                        isUser
                          ? "bg-purple-600/60 text-white rounded-br-md shadow-lg"
                          : "bg-white/10 text-foreground rounded-bl-md border border-white/5",
                      )}
                    >
                      {isUnlocked ? (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm">
                          {message.content}
                        </motion.p>
                      ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                          <Lock className="h-3 w-3 opacity-60" />
                          <span className="text-sm italic opacity-60">Locked</span>
                        </motion.div>
                      )}
                      <p className={cn("text-xs mt-1", isUnlocked ? "opacity-60" : "opacity-40")}>{message.timestamp}</p>
                    </motion.div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          <div className="px-4 py-3 border-t border-white/5 flex gap-2">
            <div className="flex items-center justify-center gap-4">
              <Smile className="h-4 w-4 text-gray-500" />
              <ImageIcon className="h-4 w-4 text-gray-500" />
            </div>
            <Input placeholder="Type a message..." className="flex-1 bg-white/5 border-0" disabled />
            {/* add image icon and emoji icon */}
            <div className="flex items-center justify-center gap-4">
              <Button variant="ghost" className="p-2 rounded-full" disabled>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-sm text-muted-foreground mt-8"
      >
        Click on any message to unlock it
      </motion.p>
    </div>
  )
}
