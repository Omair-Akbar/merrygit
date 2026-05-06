"use client"

import { motion } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserStatusIndicatorProps {
  isOnline: boolean
  isViewing: boolean
  showViewingStatus?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function UserStatusIndicator({
  isOnline,
  isViewing,
  showViewingStatus = true,
  size = "md",
  className,
}: UserStatusIndicatorProps) {
  const sizeClasses = {
    sm: {
      dot: "h-2.5 w-2.5",
      icon: "h-4 w-4",
      container: "gap-1",
    },
    md: {
      dot: "h-2.5 w-2.5",
      icon: "h-4 w-4",
      container: "gap-1.5",
    },
    lg: {
      dot: "h-3 w-3",
      icon: "h-5 w-5",
      container: "gap-2",
    },
  }

  const sizes = sizeClasses[size]

  return (
    <div className={cn("flex items-center", sizes.container, className)}>
      {/* Online status dot */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={cn("rounded-full", sizes.dot, isOnline ? "bg-green-500" : "bg-muted-foreground/50")}
      >
        {isOnline && (
          <motion.div
            className="h-full w-full rounded-full bg-green-500"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
        )}
      </motion.div>

      {/* Viewing status icon */}
      {isViewing &&
        <>
          {showViewingStatus && (
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              title={isViewing ? "Currently viewing chat" : "Not viewing chat"}
            >
              {isViewing ? (
                <Eye className={cn(sizes.icon, "text-foreground")} />
              ) : (
                <EyeOff className={cn(sizes.icon, "text-muted-foreground")} />
              )}
            </motion.div>
          )}
        </>
        }
    </div>
  )
}
