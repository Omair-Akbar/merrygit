"use client"

import type React from "react"
import { useEffect } from "react"
import { Provider, useDispatch } from "react-redux"
import { store, type AppDispatch } from "@/lib/store/store"
import { ThemeProvider } from "@/components/theme-provider"
import { getCurrentUser } from "@/lib/store/slices/auth-slice"

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(getCurrentUser())
  }, [dispatch])

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <AuthInitializer>{children}</AuthInitializer>
      </ThemeProvider>
    </Provider>
  )
}
