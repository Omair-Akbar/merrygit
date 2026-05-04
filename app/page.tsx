"use client"

import { motion } from "framer-motion"
import { Shield, Lock, Eye, Zap, ArrowRight, Star } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { ChatDemo } from "@/components/chats/chat-demo"
import { TextShimmer } from "@/components/ui/text-shimmer"
import { BackgroundBeamsWithCollision } from "@/components/home/backgroundBeams"
import { GlowingEffect } from "@/components/home/glowingEffect"


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

const testimonials = [
  {
    name: "Sarah K.",
    role: "Security Engineer",
    avatar: "SK",
    content:
      "MerryGit is the only app I trust for sensitive work conversations. The encryption is rock-solid and the UX is actually pleasant to use.",
    rating: 5,
  },
  {
    name: "Marcus J.",
    role: "Privacy Advocate",
    avatar: "MJ",
    content:
      "I've tried every encrypted messenger out there. MerryGit is the first one that doesn't make me compromise on either privacy or speed.",
    rating: 5,
  },
  {
    name: "Priya R.",
    role: "Journalist",
    avatar: "PR",
    content:
      "My sources need to know their identity is safe. MerryGit gives me the confidence to have conversations that matter without fear.",
    rating: 5,
  },
  {
    name: "Tobias W.",
    role: "CTO",
    avatar: "TW",
    content:
      "We switched our entire team to MerryGit. Zero data stored on servers means zero risk. The team loves it.",
    rating: 5,
  },
  {
    name: "Aisha M.",
    role: "Human Rights Lawyer",
    avatar: "AM",
    content:
      "In my line of work, confidentiality isn't optional. MerryGit delivers military-grade privacy wrapped in a beautiful interface.",
    rating: 5,
  },
  {
    name: "Leo C.",
    role: "Startup Founder",
    avatar: "LC",
    content:
      "We needed secure comms for our early-stage ideas. MerryGit was the obvious answer — it just works, perfectly.",
    rating: 5,
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
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background Gradient Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Looping Morphing Shapes */}
        <motion.div
          animate={{
            scale: [1, 1.2, 0.9, 1.1, 1],
            x: [0, 100, -50, 50, 0],
            y: [0, -50, 100, -20, 0],
            borderRadius: ["50% 50% 50% 50%", "30% 70% 70% 30% / 30% 30% 70% 70%", "60% 40% 30% 70% / 60% 30% 70% 40%", "50% 50% 50% 50%"],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-5%] w-[70%] h-[70%] bg-purple-600/15 blur-[130px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 0.9, 1.1, 1, 1.2],
            x: [0, -80, 40, -20, 0],
            y: [0, 100, -60, 40, 0],
            borderRadius: ["50% 50% 50% 50%", "70% 30% 30% 70% / 60% 60% 40% 40%", "40% 60% 40% 60% / 30% 70% 30% 70%", "50% 50% 50% 50%"],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] left-[-5%] w-[70%] h-[70%] bg-blue-600/10 blur-[130px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 0.8, 1.1, 1],
            x: [0, 60, -80, 30, 0],
            y: [0, 80, -40, 90, 0],
            borderRadius: ["50% 50% 50% 50%", "40% 60% 80% 20% / 20% 40% 60% 80%", "50% 50% 50% 50%"],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-indigo-500/10 blur-[140px]"
        />
        <motion.div
          animate={{
            scale: [0.8, 1.1, 1, 1.2, 0.8],
            x: [0, -40, 70, -30, 0],
            y: [0, -90, 40, -50, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 8 }}
          className="absolute bottom-1/4 right-1/4 w-[45%] h-[45%] bg-cyan-500/10 blur-[140px] rounded-full"
        />
      </div>

      <Header />

      <main className="flex-1">
        {/* ─── Hero Section with BackgroundBeamsWithCollision ─── */}
        <BackgroundBeamsWithCollision className="min-h-[90vh] md:min-h-screen flex-col py-20 md:py-32Z bg-transparent!">
          <div className="container relative z-10 mx-auto px-4 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center font-exo">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <motion.h1
                  variants={itemVariants}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance"
                >
                  Private conversations,{" "}
                  <TextShimmer>truly private.</TextShimmer>
                </motion.h1>

                <motion.p
                  variants={itemVariants}
                  className="text-lg text-muted-foreground max-w-lg"
                >
                  MerryGit uses military-grade encryption to keep your messages
                  safe. No one can read them except you and your recipient.
                </motion.p>

                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button size="lg" variant="secondary" asChild className="group">
                      <Link href="/signup">
                        Get Started Free
                        <motion.span
                          className="ml-2 inline-block"
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
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
                      <div className="text-2xl font-bold ">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">
                        {stat.label}
                      </div>
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
                <ChatDemo />
              </motion.div>
            </div>
          </div>
        </BackgroundBeamsWithCollision>

        {/* ─── Features Section ─── */}
        <section className="relative py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-exo">
                Security without compromise
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Built from the ground up with privacy and security as the
                foundation.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ transition: { duration: 0.2 } }}
                  className="group relative p-6 rounded-xl bg-background/20 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl overflow-hidden"
                >
                  <motion.div
                    initial={{ left: "-100%" }}
                    whileHover={{ left: "100%" }}
                    transition={{ duration: 0.6 }}
                    className="absolute top-0 h-[2px] w-full bg-linear-to-r from-transparent via-purple-500 to-transparent opacity-50"
                  />
                  <motion.div
                    initial={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <feature.icon className="h-10 w-10 mb-4 transition-colors group-hover:text-foreground" />
                  </motion.div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How it works ─── */}
        <section className="py-20 font-exo">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How it works
              </h2>
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
                {
                  step: "02",
                  title: "Find Friends",
                  desc: "Search and connect with other MerryGit users.",
                },
                {
                  step: "03",
                  title: "Chat Securely",
                  desc: "Your messages are encrypted end-to-end automatically.",
                },
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
                    transition={{ duration: 3, repeat: Infinity }}
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

        {/* ─── Testimonials Section with GlowingEffect Cards ─── */}
        <section className="py-20 bg-secondary/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Trusted by privacy-conscious people
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From journalists to security engineers — people who can't afford
                to compromise.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative rounded-2xl border border-white/10 bg-background/40 backdrop-blur-sm p-6 shadow-lg"
                >
                  {/* GlowingEffect border that activates on mouse proximity */}
                  <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={2}
                  />

                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">
                        {testimonial.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA Section ─── */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-secondary/50 to-transparent" />
          <div className="container relative z-10 mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to chat securely?
              </h2>
              <p className="text-muted-foreground">
                Join thousands of users who trust MerryGit for their private
                conversations.
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