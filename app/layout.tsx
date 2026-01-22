import type React from "react"
import type { Metadata } from "next"
import { Inter, Geist_Mono, Exo } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Toaster } from "react-hot-toast"
import { LoadingWrapper } from "@/components/LoadingWrapper"

// <CHANGE> Load Inter font for body text
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-inter",
  display: "swap",
})

// <CHANGE> Load Exo font for titles/headings
const exo = Exo({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-exo",
  display: "swap",
})

export const metadata: Metadata = {
  title: "MerryGit - End-to-End Encrypted Messaging",
  description: "Private, secure, end-to-end encrypted chat application",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  generator: 'merrygit'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en" suppressHydrationWarning className={`${exo.variable} ${inter.variable}`}>
      <body className="antialiased">
        <Providers>
          <LoadingWrapper>
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--background)',
                  borderRadius: '10px',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-inter), sans-serif',
                },
                success: {
                  iconTheme: {
                    primary: 'var(--success)',
                    secondary: 'var(--background)',
                  },
                },
                error: {
                  iconTheme: {
                    primary: 'var(--destructive)',
                    secondary: 'var(--background)',
                  },
                },
              }}
            />
            {children}
          </LoadingWrapper>
        </Providers>
      </body>
    </html>
  )
}
