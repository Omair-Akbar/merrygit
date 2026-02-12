"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { registerUser, setOtpEmail } from "@/lib/store/slices/auth-slice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { Loader2, Check, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"

// Validation Schema
const signupSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must not exceed 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .toLowerCase(),
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  phoneNumber: z.string()
    .optional()
    .refine((val) => !val || /^[\d\s\-\+\(\)]+$/.test(val), "Invalid phone number format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type SignupFormData = z.infer<typeof signupSchema>

export function SignupForm() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isLoading } = useAppSelector((state) => state.auth)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, touchedFields },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      username: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  })

  const password = watch("password")
  const confirmPassword = watch("confirmPassword")

  const getPasswordChecks = (pass: string) => ({
    length: pass.length >= 8,
    uppercase: /[A-Z]/.test(pass),
    lowercase: /[a-z]/.test(pass),
    number: /[0-9]/.test(pass),
    special: /[^A-Za-z0-9]/.test(pass),
  })

  const passwordChecks = getPasswordChecks(password || "")
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length
  const showPasswordFeedback = touchedFields.password && password && password.length > 0

  const onSubmit = async (data: SignupFormData) => {
    try {
      await dispatch(
        registerUser({
          name: data.name,
          username: data.username,
          email: data.email,
          password: data.password,
          phoneNumber: data.phoneNumber || "",
        })
      ).unwrap()

      dispatch(setOtpEmail(data.email))
      toast.success("Registration successful! Check your email for OTP.")
      router.push("/verify-otp")
    } catch (err) {
      toast.error((err as string) || "Registration failed")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          className={errors.name ? "border-destructive" : ""}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Username Field */}
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="johndoe"
          className={errors.username ? "border-destructive" : ""}
          {...register("username")}
        />
        {errors.username && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.username.message}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          className={errors.email ? "border-destructive" : ""}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Phone Number Field (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">
          Phone Number <span className="text-muted-foreground text-xs">(Optional)</span>
        </Label>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder="+1 (555) 123-4567"
          className={errors.phoneNumber ? "border-destructive" : ""}
          {...register("phoneNumber")}
        />
        {errors.phoneNumber && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.phoneNumber.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          placeholder="Create a strong password"
          className={errors.password ? "border-destructive" : ""}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.password.message}
          </p>
        )}

        {/* Password Strength Indicator */}
        {showPasswordFeedback && passwordStrength < 5 && (
          <div className="space-y-2 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-all duration-300",
                    level <= passwordStrength
                      ? passwordStrength <= 2
                        ? "bg-red-500"
                        : passwordStrength <= 3
                        ? "bg-yellow-500"
                        : passwordStrength === 4
                        ? "bg-blue-500"
                        : "bg-green-500"
                      : "bg-muted"
                  )}
                />
              ))}
            </div>
            <div className="space-y-1">
              {Object.entries(passwordChecks)
                .filter(([_, isValid]) => !isValid)
                .map(([key]) => (
                  <div key={key} className="flex items-center gap-2 text-xs text-muted-foreground animate-in fade-in slide-in-from-left-1 duration-200">
                    <X className="h-3 w-3" />
                    <span>
                      {key === "length" && "At least 8 characters"}
                      {key === "uppercase" && "One uppercase letter"}
                      {key === "lowercase" && "One lowercase letter"}
                      {key === "number" && "One number"}
                      {key === "special" && "One special character"}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
        {/* {showPasswordFeedback && passwordStrength === 5 && (
          <div className="mt-2 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
              <Check className="h-4 w-4" />
              <span className="font-medium">Password meets all requirements!</span>
            </div>
          </div>
        )} */}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <PasswordInput
            id="confirmPassword"
            placeholder="Confirm your password"
            className={cn(
              errors.confirmPassword ? "border-destructive" : "",
              confirmPassword && password === confirmPassword ? "" : ""
            )}
            {...register("confirmPassword")}
          />
          {confirmPassword && password && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              {password === confirmPassword ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-destructive" />
              )}
            </div>
          )}
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full text-white dark:text-white"
        disabled={isLoading || !isValid}
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

      {/* Sign In Link */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-black dark:text-white hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
