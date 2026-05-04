"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Logo } from "@/components/ui/logo"
import { Twitter, Github, Linkedin, Mail, Shield } from "lucide-react"

const footerLinks = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Security", href: "/security" },
    { label: "Pricing", href: "/pricing" },
    { label: "Changelog", href: "/changelog" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "Status", href: "/status" },
    { label: "Community", href: "/community" },
  ],
}

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Mail, href: "#", label: "Email" },
]

export function Footer() {
  return (
    <footer className="relative border-t border-border/50 bg-background/20 backdrop-blur-sm overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-950/10 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 pt-16 pb-8 relative z-10">
        {/* Top grid: brand + links */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <Logo size={32} />
              <span className="font-bold text-lg tracking-tight font-exo">MerryGit</span>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs font-exo">
              End-to-end encrypted messaging for those who value their privacy.
              Your conversations, only yours.
            </p>

            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-400">
              <Shield className="h-3 w-3" />
              <span>256-bit encrypted</span>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-secondary/40 text-muted-foreground transition-colors hover:border-purple-500/50 hover:text-foreground hover:bg-purple-500/10"
                >
                  <Icon className="h-3.5 w-3.5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="col-span-1 space-y-4">
              <h4 className="text-sm font-semibold text-foreground">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground ">
          <p>
            &copy; {new Date().getFullYear()} MerryGit. All rights reserved.
          </p>

          {/* <div className="flex items-center gap-1">
            <span>Built with</span>
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              className="text-red-500 mx-0.5"
            >
              ♥
            </motion.span>
            <span>for privacy</span>
          </div> */}

          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-foreground transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}