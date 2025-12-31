"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Menu, X, Star, Github, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import { Logo } from "@/components/ui/logo"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { logoutUser } from "@/lib/store/slices/auth-slice"
import { toast } from "react-hot-toast"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/privacy", label: "Privacy" },
]

const GITHUB_REPO_URL = process.env.NEXT_PUBLIC_GITHUB_REPO_URL || "https://github.com/Omair-Akbar/frontend-chatapp"
const GITHUB_API_URL =
  process.env.NEXT_PUBLIC_GITHUB_API_URL || "https://api.github.com/repos/Omair-Akbar/frontend-chatapp"

function formatStarCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

function GitHubStars() {
  const [starCount, setStarCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(GITHUB_API_URL)}`)
        const data = await response.json()

        if (data.contents) {
          const repoData = JSON.parse(data.contents)
          setStarCount(repoData.stargazers_count || 0)
        }
      } catch (error) {
        console.error("Failed to fetch GitHub stars:", error)
        setStarCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStars()

    const interval = setInterval(fetchStars, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-8 rounded-full" />
      </div>
    )
  }

  return (
    <a
      href={GITHUB_REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground text-muted-foreground"
    >
      <Github className="h-4 w-4 transition-transform group-hover:scale-110" />
      <span className="hidden sm:inline">GitHub</span>
      {starCount !== null && starCount > 0 && (
        <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs transition-colors group-hover:bg-muted/80">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          {formatStarCount(starCount)}
        </span>
      )}
    </a>
  )
}

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
      toast.success("Logged out successfully")
      router.push("/")
    } catch (error) {
      toast.error("Failed to logout")
    }
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={36} />
          <span className="text-lg font-semibold">MerryGit</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                pathname === link.href ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}

          <GitHubStars />
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/profile">Profile</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 bg-transparent">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div initial={false} animate={{ height: isMenuOpen ? "auto" : 0 }} className="overflow-hidden md:hidden">
        <div className="container mx-auto px-4 pb-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                "block py-2 text-sm font-medium transition-colors",
                pathname === link.href ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-2 border-t border-border/50">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
              <div className="flex flex-col">
                <span>GitHub Repository</span>
                <span className="text-xs text-muted-foreground/70">Open source chat application</span>
              </div>
            </a>
          </div>

          <div className="flex flex-col gap-2 pt-3">
            {isAuthenticated ? (
              <>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                    Profile
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 bg-transparent"
                  onClick={() => {
                    setIsMenuOpen(false)
                    handleLogout()
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button variant="secondary" className="w-full" asChild>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.header>
  )
}
