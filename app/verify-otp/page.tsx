"use client"

import { AuthLayout } from "@/components/layout/auth-layout"
import { VerifyOtpForm } from "@/components/auth/verify-otp-form"

export default function VerifyOtpPage() {
  return (
    <AuthLayout title="Verify your email" subtitle="Enter the 6-digit code we sent to your email">
      <VerifyOtpForm />
    </AuthLayout>
  )
}
