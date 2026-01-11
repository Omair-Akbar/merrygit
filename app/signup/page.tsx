"use client"

import { AuthLayout } from "@/components/layout/auth-layout"
import { SignupForm } from "@/components/auth/signup-form"
import { useAppSelector } from "@/lib/store/hooks"
import { useEffect } from "react"
import { useRouter } from "next/navigation"


export default function SignupPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/chat")
    }
  }, [isAuthenticated, router])

  return (
    <AuthLayout title="Create an account" subtitle="Join MerryGit and start messaging securely">
      <SignupForm />
    </AuthLayout>
  )
}
