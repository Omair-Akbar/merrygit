"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  const { isLoading } = useAppSelector((state) => state.auth)

  const [showErrors, setShowErrors] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)
  const confirmPassword = formData.confirmPassword // Declare confirmPassword variable

  const getPasswordChecks = (pass: string) => ({
    length: pass.length >= 8,
    uppercase: /[A-Z]/.test(pass),
    lowercase: /[a-z]/.test(pass),
    number: /[0-9]/.test(pass),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
  })

  const validatePassword = (pass: string) => {
    const checks = getPasswordChecks(pass)
    return Object.values(checks).filter(Boolean).length >= 4
  }

  const getPasswordStrength = (pass: string) => {
    const checks = getPasswordChecks(pass)
    return Object.values(checks).filter(Boolean).length
  }

  const validateUsername = (user: string) => /^[a-zA-Z0-9_]{3,20}$/.test(user)

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const validateForm = (data: typeof formData): boolean => {
    const newErrors: Record<string, string> = {}

    if (!data.name.trim()) {
      newErrors.name = "Name is required"
    }
    // if (!data.phoneNumber.trim()) {
    //   newErrors.phoneNumber = "Phone number is required"
    // }
    if (!validateUsername(data.username)) {
      newErrors.username = "Username must be 3-20 characters (letters, numbers, underscore)"
    }
    if (!validateEmail(data.email)) {
      newErrors.email = "Invalid email address"
    }
    if (!validatePassword(data.password)) {
      newErrors.password = "Password does not meet security requirements"
    }
    if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const nextValue = name === "username" ? value.toLowerCase() : value
    const nextFormData = { ...formData, [name]: nextValue }
    setFormData(nextFormData)
    
    // Show password requirements when user starts typing in password field
    if (name === "password" && value.length > 0) {
      setShowPasswordRequirements(true)
    }

    if (showErrors) {
      validateForm(nextFormData)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setShowErrors(true)
    if (!validateForm(formData)) {
      return
    }

    try {
      await dispatch(
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

  const passwordChecks = getPasswordChecks(formData.password)
  const passwordStrength = getPasswordStrength(formData.password)
  const passwordIsPerfect = Object.values(passwordChecks).every(Boolean)

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className={showErrors && errors.name ? "border-destructive" : ""}
              autoFocus
            />
            <AnimatePresence mode="wait">
              {showErrors && errors.name && (
                <motion.p
                  key="name-error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-xs text-destructive"
                >
                  {errors.name}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={showErrors && errors.phoneNumber ? "border-destructive" : ""}
            />
            <AnimatePresence mode="wait">
              {showErrors && errors.phoneNumber && (
                <motion.p
                  key="phone-error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-xs text-destructive"
                >
                  {errors.phoneNumber}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
              className={showErrors && errors.username ? "border-destructive" : ""}
            />
            <AnimatePresence mode="wait">
              {showErrors && errors.username && (
                <motion.p
                  key="username-error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-xs text-destructive"
                >
                  {errors.username}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className={showErrors && errors.email ? "border-destructive" : ""}
            />
            <AnimatePresence mode="wait">
              {showErrors && errors.email && (
                <motion.p
                  key="email-error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-xs text-destructive"
                >
                  {errors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              className={showErrors && errors.password ? "border-destructive" : ""}
            />
            <AnimatePresence mode="wait">
              {showErrors && errors.password && (
                <motion.p
                  key="password-error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-xs text-destructive"
                >
                  {errors.password}
                </motion.p>
              )}
            </AnimatePresence>

            {showPasswordRequirements && formData.password.length > 0 && !passwordIsPerfect && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 mt-3"
              >
                {/* Progress bars for password strength */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <motion.div
                      key={level}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-colors",
                        level <= passwordStrength
                          ? passwordStrength <= 2
                            ? "bg-red-500"
                            : passwordStrength <= 3
                            ? "bg-yellow-500"
                            : passwordStrength <= 4
                            ? "bg-blue-500"
                            : "bg-green-500"
                          : "bg-muted"
                      )}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: level <= passwordStrength ? 1 : 0 }}
                      transition={{ duration: 0.3, delay: level * 0.05 }}
                    />
                  ))}
                </div>

                {/* Password requirements - show one at a time */}
                <div className="space-y-2 text-xs">
                  <AnimatePresence mode="wait">
                    {!passwordChecks.length && (
                      <motion.div
                        key="length"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-2"
                      >
                        <X className="h-3 w-3 text-destructive" />
                        <span className="text-muted-foreground">At least 8 characters</span>
                      </motion.div>
                    )}
                    {passwordChecks.length && !passwordChecks.uppercase && (
                      <motion.div
                        key="uppercase"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-2"
                      >
                        <X className="h-3 w-3 text-destructive" />
                        <span className="text-muted-foreground">One uppercase letter</span>
                      </motion.div>
                    )}
                    {passwordChecks.length && passwordChecks.uppercase && !passwordChecks.lowercase && (
                      <motion.div
                        key="lowercase"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-2"
                      >
                        <X className="h-3 w-3 text-destructive" />
                        <span className="text-muted-foreground">One lowercase letter</span>
                      </motion.div>
                    )}
                    {passwordChecks.length && passwordChecks.uppercase && passwordChecks.lowercase && !passwordChecks.number && (
                      <motion.div
                        key="number"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-2"
                      >
                        <X className="h-3 w-3 text-destructive" />
                        <span className="text-muted-foreground">One number</span>
                      </motion.div>
                    )}
                    {passwordChecks.length && passwordChecks.uppercase && passwordChecks.lowercase && passwordChecks.number && !passwordChecks.special && (
                      <motion.div
                        key="special"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-2"
                      >
                        <X className="h-3 w-3 text-destructive" />
                        <span className="text-muted-foreground">One special character</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={cn(
                  showErrors && errors.confirmPassword ? "border-destructive" : "",
                  confirmPassword.length > 0 ? "pr-10" : ""
                )}
              />
              {formData.confirmPassword.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-10 top-1/2 -translate-y-1/2"
                >
                  {passwordsMatch ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                </motion.div>
              )}
            </div>
            <AnimatePresence mode="wait">
              {showErrors && errors.confirmPassword && (
                <motion.p
                  key="confirm-password-error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-xs text-destructive"
                >
                  {errors.confirmPassword}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-row md:flex-col-reverse gap-3">
          <Button
            type="submit"
            variant="default"
            className="w-full dark:text-black dark:bg-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-sm text-muted-foreground"
        >
          Already have an account?{" "}
          <Link href="/login" className="text-foreground hover:underline">
            Sign in
          </Link>
        </motion.p>
      </form>
    </div>
  )
}
