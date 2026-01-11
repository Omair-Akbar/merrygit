"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Moon,
  Sun,
  Monitor,
  Lock,
  Bell,
  Volume2,
  User,
  Shield,
  LogOut,
  Camera,
  Trash2,
  Upload,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { logoutUser } from "@/lib/store/slices/auth-slice"
import { uploadAvatar, deleteAvatar } from "@/lib/store/slices/profile-slice"
import {
  setLockDisplayMode,
  setCustomLockText,
  toggleNotifications,
  toggleSound,
} from "@/lib/store/slices/settings-slice"
import { toast } from "react-hot-toast"

export default function SettingsPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { theme, setTheme } = useTheme()
  const { lockDisplayMode, customLockText, notifications, soundEnabled } = useAppSelector((state) => state.settings)
  const { user } = useAppSelector((state) => state.auth)
  const { isLoading } = useAppSelector((state) => state.profile)

  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentUser = user || {
    name: "User",
    username: "user",
    avatar: undefined,
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewAvatar(url)
  }

  const handleUploadAvatar = async () => {
    if (previewAvatar) {
      const file = fileInputRef.current?.files?.[0]
      if (file) {
        await dispatch(uploadAvatar(file))
        setPreviewAvatar(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }
  }

  const handleRemoveAvatar = async () => {
    if (window.confirm("Are you sure you want to delete your avatar?")) {
      await dispatch(deleteAvatar())
      setPreviewAvatar(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
      toast.success("Logged out successfully")
      router.push("/")
    } catch (error) {
      toast.error("Failed to logout")
    }
  }

  const displayAvatar = previewAvatar || currentUser.avatar

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 sticky top-0 bg-background/80 backdrop-blur-xl z-10">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="cursor-pointer">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold">Settings</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <section className="space-y-4">
            <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Profile Picture</h2>
            <div className="p-4 rounded-lg border border-border ">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    {displayAvatar && <AvatarImage src={displayAvatar || "/placeholder.svg"} alt={currentUser.name} />}
                    <AvatarFallback className="text-xl bg-secondary text-secondary-foreground">
                      {currentUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {/* <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 h-7 w-7 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </Button> */}
                </div>
                <div className="flex-1 space-y-2">
                  <p className="font-bold text-base">{currentUser.name}</p>
                  <p className="text-sm text-muted-foreground">@{currentUser.username}</p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={isLoading}
              />

              {/* <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                  disabled={isLoading}
                >
                  <Camera className="h-4 w-4" />
                  Set Picture
                </Button>

                {previewAvatar && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleUploadAvatar}
                    className="gap-2"
                    disabled={isLoading}
                  >
                    <Upload className="h-4 w-4" />
                    Upload
                  </Button>
                )}

                {(currentUser.avatar || previewAvatar) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    className="gap-2 text-destructive hover:text-destructive"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div> */}
            </div>
          </section>

          {/* Account Section */}
          <section className="space-y-4">
            <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Account</h2>
            <div className="space-y-2">
              <Link
                href="/profile"
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <User className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-bold text-sm">My Profile</p>
                  <p className="text-xs text-muted-foreground">Edit your profile information</p>
                </div>
              </Link>
              <Link
                href="/update-password"
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-bold text-sm">Change Password</p>
                  <p className="text-xs text-muted-foreground">Update your password</p>
                </div>
              </Link>
            </div>
          </section>

          {/* Appearance Section */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Appearance</h2>
            <div className="p-4 rounded-lg border border-border space-y-4">
              <div>
                <Label className="text-base">Theme</Label>
                <p className="text-xs text-muted-foreground mb-3">Choose your preferred theme</p>
                <RadioGroup value={theme} onValueChange={(value: any) => setTheme(value)} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                      <Sun className="h-4 w-4" />
                      Light
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                      <Moon className="h-4 w-4" />
                      Dark
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer">
                      <Monitor className="h-4 w-4" />
                      System
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </section>

          {/* Locked Messages Section */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Locked Messages</h2>
            <div className="p-4 rounded-lg border border-border space-y-4">
              <div>
                <Label className="text-base">Display Mode</Label>
                <p className="text-xs text-muted-foreground mb-3">How locked messages appear in chat</p>
                <RadioGroup
                  value={lockDisplayMode}
                  onValueChange={(value: any) => dispatch(setLockDisplayMode(value as "text" | "icon" | "custom"))}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="text" id="lock-text" />
                    <Label htmlFor="lock-text" className="flex items-center gap-2 cursor-pointer">
                      <Lock className="h-4 w-4" />
                      <span className="italic">Locked</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="icon" id="lock-icon" />
                    <Label htmlFor="lock-icon" className="flex items-center gap-2 cursor-pointer">
                      <Lock className="h-4 w-4" />
                      Icon only
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="custom" id="lock-custom" />
                    <Label htmlFor="lock-custom" className="cursor-pointer">
                      Custom text
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <AnimatePresence>
                {lockDisplayMode === "custom" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <Label htmlFor="customText">Custom Lock Text</Label>
                    <Input
                      id="customText"
                      value={customLockText}
                      onChange={(e) => dispatch(setCustomLockText(e.target.value))}
                      placeholder="Enter custom text..."
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Notifications Section */}
          {/* <section className="space-y-4">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Notifications</h2>
            <div className="p-4 rounded-lg border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-bold text-sm">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">Get notified about new messages</p>
                  </div>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={notifications} onChange={() => dispatch(toggleNotifications())} />
                  <span className="slider"></span>
                </label>              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-bold text-sm">Sound</p>
                    <p className="text-xs text-muted-foreground">Play sound for notifications</p>
                  </div>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={soundEnabled} onChange={() => dispatch(toggleSound())} />
                  <span className="slider"></span>
                </label>              </div>
            </div>
          </section> */}

          {/* Legal Section */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Legal</h2>
            <div className="space-y-2">
              <Link
                href="/privacy"
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <Shield className="h-5 w-5 text-muted-foreground" />
                <p className="font-bold text-sm">Privacy Policy</p>
              </Link>
            </div>
          </section>

          <Button variant="secondary" className="w-full text-destructive hover:text-destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </Button>
        </motion.div>
      </main>
    </div>
  )
}
