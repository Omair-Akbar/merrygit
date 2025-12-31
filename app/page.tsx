"use client"

import { motion } from "framer-motion"
import { Shield, Lock, Eye, Zap, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { ChatDemo } from "@/components/chat/chat-demo"
import { AnimatedGrid } from "@/components/ui/animated-grid"
import { TextShimmer } from "@/components/ui/text-shimmer"

const features = [
  {
    icon: Shield,
    title: "End-to-End Encrypted",
    description: "Your messages are encrypted on your device and can only be decrypted by the recipient.",
  },
  {
    icon: Lock,
    title: "One Message at a Time",
    description: "Unique focus mode shows one unlocked message while others remain secured.",
  },
  {
    icon: Eye,
    title: "Privacy First",
    description: "We never store your messages or encryption keys on our servers.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Real-time messaging with instant delivery and read receipts.",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32">
          {/* Background effects */}
          <AnimatedGrid />

          <div className="container relative z-10 mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                {/* <motion.div variants={itemVariants}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary/50 text-sm mb-4"
                  >
                    <motion.span
                      className="h-2 w-2 rounded-full bg-foreground"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    />
                    End-to-end encrypted messaging
                  </motion.div>
                </motion.div> */}

                <motion.h1
                  variants={itemVariants}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance"
                >
                  Private conversations, <TextShimmer>truly private.</TextShimmer>
                </motion.h1>

                <motion.p variants={itemVariants} className="text-lg text-muted-foreground max-w-lg">
                  MerryGit uses military-grade encryption to keep your messages safe. No one can read them except you
                  and your recipient.
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button size="lg" variant="secondary" asChild className="group">
                      <Link href="/signup">
                        Get Started Free
                        <motion.span
                          className="ml-2 inline-block"
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </motion.span>
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/features">Learn More</Link>
                    </Button>
                  </motion.div>
                </motion.div>

                {/* Stats */}
                <motion.div variants={itemVariants} className="flex gap-8 pt-4">
                  {[
                    { value: "256-bit", label: "Encryption" },
                    { value: "100%", label: "Private" },
                    { value: "0", label: "Data Stored" },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="text-center"
                    >
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40, rotateY: -10 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="perspective-1000"
              >
                <div>
                  <ChatDemo />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <motion.h2
                className="text-3xl md:text-4xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Security without compromise
              </motion.h2>
              <motion.p
                className="text-muted-foreground max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                Built from the ground up with privacy and security as the foundation.
              </motion.p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="group p-6 rounded-xl bg-card border border-border hover:border-foreground/20 transition-all duration-300"
                >
                  <motion.div
                    initial={{ scale: 1 }}
                    // whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <feature.icon className="h-10 w-10 mb-4 transition-colors group-hover:text-foreground" />
                  </motion.div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Simple, secure, and private messaging in three easy steps.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  step: "01",
                  title: "Create Account",
                  desc: "Sign up with just your email. No phone number required.",
                },
                { step: "02", title: "Find Friends", desc: "Search and connect with other MerryGit users." },
                { step: "03", title: "Chat Securely", desc: "Your messages are encrypted end-to-end automatically." },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="text-center relative"
                >
                  <motion.div
                    className="text-6xl font-bold text-foreground/5 absolute -top-4 left-1/2 -translate-x-1/2"
                    animate={{ opacity: [0.05, 0.1, 0.05] }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                  >
                    {item.step}
                  </motion.div>
                  <div className="relative z-10 pt-8">
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-secondary/50 to-transparent" />

          <div className="container relative z-10 mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto space-y-6"
            >
              <motion.h2
                className="text-3xl md:text-4xl font-bold"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
              >
                Ready to chat securely?
              </motion.h2>
              <p className="text-muted-foreground">
                Join thousands of users who trust MerryGit for their private conversations.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/signup">
                    Create Free Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
