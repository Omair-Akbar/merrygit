"use client"

import type React from "react"
import { useEffect } from "react"
import { Provider, useDispatch } from "react-redux"
import { store, type AppDispatch } from "@/lib/store/store"
import { ThemeProvider } from "@/components/theme-provider"
import { getCurrentUser } from "@/lib/store/slices/auth-slice"
import { useAppSelector } from "@/lib/store/hooks"


function AuthInitializer({ children }: { children: React.ReactNode }) {
    const { user } = useAppSelector((state) => state.auth)
  
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (!user) dispatch(getCurrentUser())
  }, [dispatch, user])

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
