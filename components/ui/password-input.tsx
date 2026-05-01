"use client"

import * as React from "react"
import { Eye, EyeOff, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrength?: boolean
}

export function PasswordInput({ className, showStrength = false, value, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const [wasAllMet, setWasAllMet] = React.useState(false)
  const [hideAnimation, setHideAnimation] = React.useState(false)

  const password = typeof value === "string" ? value : ""

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  const strength = Object.values(checks).filter(Boolean).length
  const allChecksMet = Object.values(checks).every(Boolean)

  React.useEffect(() => {
    if (allChecksMet) {
      setWasAllMet(true)
      setHideAnimation(false)
    } else if (wasAllMet && password.length === 0) {
      setHideAnimation(true)
      const timer = setTimeout(() => {
        setWasAllMet(false)
        setHideAnimation(false)
      }, 300) // Match animation duration
      return () => clearTimeout(timer)
    }
  }, [allChecksMet, wasAllMet, password])

  const getStrengthColor = () => {
    if (strength <= 2) return "bg-destructive"
    if (strength <= 3) return "bg-muted-foreground"
    if (strength <= 4) return "bg-foreground/60"
    return "bg-success"
  }

  // Determine if we should show the strength indicators
  const shouldShowStrength = showStrength && 
    (password.length > 0 || hideAnimation) && 
    !(wasAllMet && password.length === 0)

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input 
          type={showPassword ? "text" : "password"} 
          className={cn("pr-10", className)} 
          value={value} 
          {...props} 
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
        </Button>
      </div>
      <AnimatePresence>
        {shouldShowStrength && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: hideAnimation ? 0 : 1, 
              height: hideAnimation ? 0 : "auto" 
            }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{ 
                    scale: hideAnimation ? 0.8 : 1,
                    opacity: hideAnimation ? 0 : 1
                  }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    i <= strength ? getStrengthColor() : "bg-muted",
                  )}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <PasswordCheck label="8+ characters" met={checks.length} hideAnimation={hideAnimation} />
              <PasswordCheck label="Uppercase" met={checks.uppercase} hideAnimation={hideAnimation} />
              <PasswordCheck label="Lowercase" met={checks.lowercase} hideAnimation={hideAnimation} />
              <PasswordCheck label="Number" met={checks.number} hideAnimation={hideAnimation} />
              <PasswordCheck label="Special char" met={checks.special} hideAnimation={hideAnimation} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PasswordCheck({ 
  label, 
  met, 
  hideAnimation 
}: { 
  label: string; 
  met: boolean; 
  hideAnimation?: boolean 
}) {
  return (
    <motion.div
      initial={false}
      animate={{ 
        scale: hideAnimation ? 0.95 : 1,
        opacity: hideAnimation ? 0 : 1
      }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-1"
    >
      {met ? (
        <motion.div
          initial={false}
          animate={{ scale: hideAnimation ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <Check className="h-3 w-3 text-success" />
        </motion.div>
      ) : (
        <X className="h-3 w-3 text-muted-foreground" />
      )}
      <span className={cn(met ? "text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
    </motion.div>
  )
}