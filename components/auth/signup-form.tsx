"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { registerUser, setOtpEmail } from "@/lib/store/slices/auth-slice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { Loader2, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"

export function SignupForm() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const confirmPassword = formData.confirmPassword // Declare confirmPassword variable

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

  const validateUsername = (user: string) => /^[a-zA-Z0-9_]{3,20}$/.test(user)

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  // const validatePhoneNumber = (phone: string) => /^\d{10,}$/.test(phone.replace(/\D/g, ""))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "username" ? value.toLowerCase() : value,
    }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!validateUsername(formData.username))
      newErrors.username = "Username must be 3-20 characters (letters, numbers, underscore)"
    if (!validateEmail(formData.email)) newErrors.email = "Invalid email address"
    // if (!validatePhoneNumber(formData.phoneNumber)) newErrors.phoneNumber = "Phone number must be at least 10 digits"
    if (!validatePassword(formData.password)) newErrors.password = "Password does not meet security requirements"
    if (formData.password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      const result = await dispatch(
        registerUser({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
        }),
      ).unwrap()

      dispatch(setOtpEmail(formData.email))
      toast.success("Registration successful! Check your email for OTP.")
      router.push("/verify-otp")
    } catch (err) {
      toast.error(err as string || "Registration failed")
    }
  }

  const passwordsMatch =
    formData.password.length > 0 && confirmPassword.length > 0 && formData.password === confirmPassword

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? "border-destructive" : ""}
          required
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-2"
      >
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="johndoe"
          value={formData.username}
          onChange={handleChange}
          className={errors.username ? "border-destructive" : ""}
          required
        />
        {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? "border-destructive" : ""}
          // required
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.25 }}
        className="space-y-2"
      >
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={formData.phoneNumber}
          onChange={handleChange}
          className={errors.phoneNumber ? "border-destructive" : ""}
          // required
        />
        {/* {errors.phoneNumber && <p className="text-xs text-destructive">{errors.phoneNumber}</p>} */}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          name="password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={handleChange}
          showStrength
          className={errors.password ? "border-destructive" : ""}
          required
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.35 }}
        className="space-y-2"
      >
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={cn(
              errors.confirmPassword ? "border-destructive" : "",
              confirmPassword.length > 0 ? "pr-10" : "",
            )}
            required
          />
          {formData.confirmPassword.length > 0 && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              {passwordsMatch ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-destructive" />
              )}
            </div>
          )}
        </div>
        {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Button type="submit" variant="default" className="w-full dark:text-black dark:bg-white" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="text-center text-sm text-muted-foreground"
      >
        Already have an account?{" "}
        <Link href="/login" className="text-foreground hover:underline">
          Sign in
        </Link>
      </motion.p>
    </form>
  )
}
