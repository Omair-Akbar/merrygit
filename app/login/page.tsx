"use client"

import { AuthLayout } from "@/components/layout/auth-layout"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account to continue">
      <LoginForm />
    </AuthLayout>
  )
}
