"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 40, className = "" }: LogoProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div style={{ width: size, height: size }} className={className} />
  }

  return (
    <Image
      src={resolvedTheme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
      alt="MerryGit Logo"
      width={size}
      height={size}
      className={className}
      priority
    />
  )
}
