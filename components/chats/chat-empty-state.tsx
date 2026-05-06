"use client"

import { motion } from "framer-motion"
import { Logo } from "@/components/ui/logo"

export function ChatEmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
        <Logo size={64} className="mx-auto" />
        <div>
          <h2 className="text-xl font-semibold">Welcome to MerryGit</h2>
          <p className="text-muted-foreground">Select a conversation to start messaging</p>
        </div>
      </motion.div>
    </div>
  )
}
