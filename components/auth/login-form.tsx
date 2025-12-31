"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { loginUser } from "@/lib/store/slices/auth-slice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"

export function LoginForm() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((state) => state.auth)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!validateEmail(email)) newErrors.email = "Invalid email address"
    if (password.length < 8) newErrors.password = "Password must be at least 8 characters"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await dispatch(loginUser({ email, password })).unwrap()
      toast.success("Login successful!")
      router.push("/chat")
    } catch (err) {
      toast.error(err as string || "Login failed")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (errors.email) setErrors((prev) => ({ ...prev, email: "" }))
          }}
          className={errors.email ? "border-destructive" : ""}
          required
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-xs hover:underline text-muted-foreground">
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (errors.password) setErrors((prev) => ({ ...prev, password: "" }))
          }}
          className={errors.password ? "border-destructive" : ""}
          required
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Button type="submit" variant="default" className="w-full dark:text-black dark:bg-white" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-center text-sm text-muted-foreground"
      >
        Don't have an account?{" "}
        <Link href="/signup" className="text-foreground hover:underline">
          Sign up
        </Link>
      </motion.p>
    </form>
  )
}
