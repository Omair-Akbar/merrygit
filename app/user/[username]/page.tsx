"use client"

import { use } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, MessageSquare, Shield, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Mock user data - replace with actual API call
const mockUserData = {
  alice: {
    id: "1",
    name: "Alice Johnson",
    username: "alice",
    bio: "Security enthusiast. Love encrypted conversations.",
    isOnline: true,
    createdAt: "2023-06-15",
  },
  bobsmith: {
    id: "2",
    name: "Bob Smith",
    username: "bobsmith",
    bio: "Software developer. Privacy advocate.",
    isOnline: false,
    lastSeen: "2 hours ago",
    createdAt: "2023-08-20",
  },
  carol_d: {
    id: "3",
    name: "Carol Davis",
    username: "carol_d",
    bio: "Digital nomad. Always on the move.",
    isOnline: true,
    createdAt: "2024-01-10",
  },
}

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const router = useRouter()

  const user = mockUserData[username as keyof typeof mockUserData] || {
    id: "unknown",
    name: "Unknown User",
    username,
    bio: "",
    isOnline: false,
    createdAt: new Date().toISOString(),
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 sticky top-0 bg-background/80 backdrop-blur-xl z-10">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold">Profile</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Avatar section */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl bg-secondary">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {user.isOnline && (
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-success border-2 border-background" />
              )}
            </div>
            <div className="mt-4 text-center">
              <h1 className="text-xl font-semibold">{user.name}</h1>
              <p className="text-muted-foreground">@{user.username}</p>
              <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
                {user.isOnline ? (
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-success" />
                    Online
                  </span>
                ) : (
                  <span>Last seen {(user as { lastSeen?: string }).lastSeen || "recently"}</span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href={`/chats?user=${user.username}`}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Link>
            </Button>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="text-center">
              <p className="text-muted-foreground">{user.bio}</p>
            </div>
          )}

          {/* Info */}
          <div className="pt-4 border-t border-border space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span>All messages are end-to-end encrypted</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>
                Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
