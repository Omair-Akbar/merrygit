"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { AuthLayout } from "@/components/layout/auth-layout"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { Loader2, Check, X } from "lucide-react"

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const validatePassword = (pass: string) => {
    const checks = {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
    }
    return Object.values(checks).filter(Boolean).length >= 4
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validatePassword(password)) {
      setError("Password does not meet security requirements")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    router.push("/login")
  }

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword

  return (
    <AuthLayout title="Update your password" subtitle="Create a new secure password for your account">
      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <Label htmlFor="password">New Password</Label>
          <PasswordInput
            id="password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showStrength
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <PasswordInput
              id="confirmPassword"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={confirmPassword.length > 0 ? "pr-10" : ""}
              required
            />
            {confirmPassword.length > 0 && (
              <div className="absolute right-10 top-1/2 -translate-y-1/2">
                {passwordsMatch ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <X className="h-4 w-4 text-destructive" />
                )}
              </div>
            )}
          </div>
        </motion.div>

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive">
            {error}
          </motion.p>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Button type="submit" variant="secondary" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </motion.div>
      </form>
    </AuthLayout>
  )
}
