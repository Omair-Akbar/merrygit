"use client"

import type React from "react"

import Link from "next/link"
import { Logo } from "@/components/ui/logo"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-[80vh] flex flex-col mt-20">
      <header className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Logo size={32} />
            <span className="font-semibold">MerryGit</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex items-center justify-center p-4 mt-12 md:mt-20">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
          <div className="border rounded-xl bg-background/50 p-6 shadow-lg">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
