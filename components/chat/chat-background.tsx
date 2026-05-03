"use client"

import { motion } from "framer-motion"

export function ChatBackground() {
  return (
    <div className="absolute h-[80vh] inset-0 z-0 pointer-events-none w-72 md:w-375">
      <motion.div
        animate={{
          scale: [1, 1.2, 0.9, 1.1, 1],
          x: [0, 100, -50, 50, 0],
          y: [0, -50, 100, -20, 0],
          borderRadius: [
            "50% 50% 50% 50%",
            "30% 70% 70% 30% / 30% 30% 70% 70%",
            "60% 40% 30% 70% / 60% 30% 70% 40%",
            "50% 50% 50% 50%",
          ],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] right-[-5%] w-[70%] h-[70%] bg-purple-600/15 blur-[130px]"
      />
      <motion.div
        animate={{
          scale: [1.2, 0.9, 1.1, 1, 1.2],
          x: [0, -80, 40, -20, 0],
          y: [0, 100, -60, 40, 0],
          borderRadius: [
            "50% 50% 50% 50%",
            "70% 30% 30% 70% / 60% 60% 40% 40%",
            "40% 60% 40% 60% / 30% 70% 30% 70%",
            "50% 50% 50% 50%",
          ],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-10%] left-[-5%] w-[70%] h-[70%] bg-blue-600/10 blur-[130px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 0.8, 1.1, 1],
          x: [0, 60, -80, 30, 0],
          y: [0, 80, -40, 90, 0],
          borderRadius: [
            "50% 50% 50% 50%",
            "40% 60% 80% 20% / 20% 40% 60% 80%",
            "50% 50% 50% 50%",
          ],
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
  )
}
