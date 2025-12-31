"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { getCurrentUser } from "@/lib/store/slices/auth-slice"
import { EditProfileForm } from "@/components/profile/edit-profile-form"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, isAuthenticated, isInitialized } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!isInitialized) {
      dispatch(getCurrentUser())
    }
  }, [dispatch, isInitialized])

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isInitialized, router])

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
      <header className="h-14 border-b border-border flex items-center justify-between px-4 sticky top-0 bg-background/80 backdrop-blur-xl z-10">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold">My Profile</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <EditProfileForm />
        </motion.div>
      </main>
    </div>
  )
}
