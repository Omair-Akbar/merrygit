"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { verifyOtp } from "@/lib/store/slices/auth-slice"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"

export function VerifyOtpForm() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { otpEmail, isLoading, error } = useAppSelector((state) => state.auth)
  const [otp, setOtp] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP")
      return
    }

    if (!otpEmail) {
      toast.error("Email not found. Please register again.")
      router.push("/signup")
      return
    }

    try {
      await dispatch(verifyOtp({ email: otpEmail, otp })).unwrap()
      toast.success("Email verified successfully!")
      router.push("/chat")
    } catch (err) {
      toast.error(err as string || "OTP verification failed")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <p className="text-base text-muted-foreground">We've sent a verification code to</p>
        <p className="font-medium text-foreground">{otpEmail}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <div className="flex justify-center my-4">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot className="h-12 w-12 mx-1 border border-muted-foreground rounded-md" key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Button
          type="submit"
          variant="default"
          className="w-full dark:text-black dark:bg-white text-base"
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Email"
          )}
        </Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-center text-sm text-muted-foreground"
      >
        Didn't receive a code?{" "}
        <button type="button" className="text-foreground hover:underline">
          Resend OTP
        </button>
      </motion.p>
    </form>
  )
}