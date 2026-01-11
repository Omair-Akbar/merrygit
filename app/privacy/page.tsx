"use client"

import { motion } from "framer-motion"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-3xl px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: January 2024</p>
            </div>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                MerryGit (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use
                our end-to-end encrypted messaging service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">2. End-to-End Encryption</h2>
              <p className="text-muted-foreground leading-relaxed">
                All messages sent through MerryGit are protected by end-to-end encryption. This means that only you
                and the person you&apos;re communicating with can read what is sent, and nobody in between, not even
                MerryGit.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Your messages are encrypted on your device before being sent</li>
                <li>Encryption keys are stored only on your device</li>
                <li>We cannot read your messages or access your encryption keys</li>
                <li>Messages are decrypted only on the recipient&apos;s device</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">3. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed">
                While we cannot access the content of your messages, we may collect the following information to provide
                and improve our services:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Account information (name, email, username)</li>
                <li>Device information (device type, operating system)</li>
                <li>Usage data (app features used, crash reports)</li>
                <li>Connection metadata (IP address, login times)</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">4. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>To provide and maintain our service</li>
                <li>To notify you about changes to our service</li>
                <li>To provide customer support</li>
                <li>To detect, prevent and address technical issues</li>
                <li>To improve our service based on usage patterns</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">5. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your account information for as long as your account is active. Encrypted messages are stored
                temporarily on our servers for delivery and are deleted once successfully delivered to all recipients.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">6. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed">You have the right to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate personal information</li>
                <li>Request deletion of your account and data</li>
                <li>Export your data in a portable format</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">7. Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your information. This includes secure data
                transmission, encrypted storage, and regular security audits. However, no method of transmission over
                the Internet is 100% secure.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">8. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-foreground">Info@MerryGit.app</p>
            </section>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
