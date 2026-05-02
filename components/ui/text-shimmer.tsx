"use client"

import type React from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface TextShimmerProps {
  children: React.ReactNode
  className?: string
}

export function TextShimmer({ children, className }: TextShimmerProps) {
  return (
    <motion.span
      className={cn(
        "relative inline-block bg-gradient-to-r from-foreground via-foreground/60 to-purple-600/60 bg-[length:200%_100%] bg-clip-text text-transparent",
        className,
      )}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        duration: 5,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop",
      }}
    >
      {children}
    </motion.span>
  )
}
