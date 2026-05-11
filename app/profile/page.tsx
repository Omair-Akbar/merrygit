"use client"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { useAppSelector } from "@/lib/store/hooks"
import { EditProfileForm } from "@/components/profile/edit-profile-form"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { BackgroundGradient } from "@/components/chats/chat-background"
import { SidebarNav } from "@/components/chats/sidebar/sidebar-nav"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isInitialized } = useAppSelector((state) => state.auth)

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="text-muted-foreground"
        >
          Loading profile...
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 sticky top-0 bg-background/5 backdrop-blur-xl z-10 w-full">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="cursor-pointer">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold font-exo">My Profile</span>
        </div>
        <ThemeToggle />
      </header>
      <BackgroundGradient />

      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <div className="hidden md:flex">
          <SidebarNav
            isDirectActive={false}
            isGroupActive={false}
            isRequestsActive={false}
            isFindUsersActive={false}
            isSettingsActive={false}
            onNavigate={(path) => router.push(path)}
            user={user}
          />
        </div>
        <main className="flex-1 container mx-auto max-w-2xl px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <EditProfileForm />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
