"use client"

import { AuthLayout } from "@/components/layout/auth-layout"
import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <AuthLayout title="Create an account" subtitle="Join MerryGit and start messaging securely">
      <SignupForm />
    </AuthLayout>
  )
}
