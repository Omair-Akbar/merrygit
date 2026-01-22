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
import { Loader2, Check, X, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"

export function SignupForm() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((state) => state.auth)

  const [currentStep, setCurrentStep] = useState(1)
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

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = "Name is required"
      }
    } else if (step === 3) {
      if (!validateUsername(formData.username)) {
        newErrors.username = "Username must be 3-20 characters (letters, numbers, underscore)"
      }
      if (!validateEmail(formData.email)) {
        newErrors.email = "Invalid email address"
      }
      if (!validatePassword(formData.password)) {
        newErrors.password = "Password does not meet security requirements"
      }
      if (formData.password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
      setErrors({})
      setShowPasswordRequirements(false)
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    setErrors({})
    setShowPasswordRequirements(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "username" ? value.toLowerCase() : value,
    }))
    
    // Show password requirements when user starts typing in password field
    if (name === "password" && value.length > 0 && currentStep === 3) {
      setShowPasswordRequirements(true)
    }
    
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
    
    if (!validateStep(3)) {
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

  const passwordChecks = getPasswordChecks(formData.password)
  const passwordStrength = getPasswordStrength(formData.password)
  const passwordIsPerfect = Object.values(passwordChecks).every(Boolean)

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Step {currentStep} of 3</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((step) => (
            <motion.div
              key={step}
              className={cn(
                "h-2 flex-1 rounded-full",
                step <= currentStep ? "bg-primary" : "bg-muted"
              )}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3, delay: step * 0.1 }}
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? "border-destructive" : ""}
                  autoFocus
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={errors.phoneNumber ? "border-destructive" : ""}
                  autoFocus
                />
                {errors.phoneNumber && <p className="text-xs text-destructive">{errors.phoneNumber}</p>}
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  className={errors.username ? "border-destructive" : ""}
                  autoFocus
                />
                {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
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
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                
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
                      errors.confirmPassword ? "border-destructive" : "",
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
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-row md:flex-col-reverse gap-3">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="w-full bg-white dark:border-gray-300 dark:text-white"
            >
              Back
            </Button>
          )}
          
          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="w-full dark:text-black dark:bg-white"
            >
              Next
            </Button>
          ) : (
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
          )}
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
