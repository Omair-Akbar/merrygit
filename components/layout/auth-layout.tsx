"use client"

import type React from "react"

import Link from "next/link"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { Logo } from "@/components/ui/logo"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useEffect } from "react"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth springs for mouse movement
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate position relative to center of screen
      mouseX.set(e.clientX - window.innerWidth / 2)
      mouseY.set(e.clientY - window.innerHeight / 2)
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Background Gradient Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Animated stationary blobs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-purple-600/20 blur-[140px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-blue-600/15 blur-[140px]"
        />
        <motion.div
          animate={{
            y: [0, 100, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-pink-500/10 blur-[100px]"
        />

        {/* Mouse interactive blobs - move AWAY from mouse */}
        <motion.div
          style={{
            x: springX,
            y: springY,
          }}
          className="absolute top-1/4 left-1/4 w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[120px]"
        />
        <motion.div
          style={{
            x: useSpring(mouseX, { stiffness: 30, damping: 25 }),
            y: useSpring(mouseY, { stiffness: 30, damping: 25 }),
          }}
          className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] rounded-full bg-cyan-500/15 blur-[120px]"
        />
      </div>

      <header className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center">
        <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={32} />
          <span className="font-semibold">MerryGit</span>
        </Link>
        <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 relative z-10 mt-16 md:mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-6"
        >
          <div className="text-center space-y-2">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-semibold"
            >
              {title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground"
            >
              {subtitle}
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="border rounded-xl bg-background/30 backdrop-blur-xl border-white/10 dark:border-white/5 p-6 shadow-2xl"
          >
            {children}
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
