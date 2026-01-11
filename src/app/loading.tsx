"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export default function RootLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      {/* Background ambient glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="ambient-glow w-96 h-96 -top-48 -left-48" />
        <div className="ambient-glow w-64 h-64 -bottom-32 -right-32 opacity-10" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative flex flex-col items-center gap-6"
      >
        {/* Logo mark with glow */}
        <div className="relative">
          <motion.div
            className="relative"
            animate={{
              boxShadow: [
                "0 0 20px hsl(16 100% 55% / 0.3)",
                "0 0 40px hsl(16 100% 55% / 0.5)",
                "0 0 20px hsl(16 100% 55% / 0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ borderRadius: "1rem" }}
          >
            <Image
              src="/NotLinear-icon.png"
              alt="NotLinear"
              width={64}
              height={64}
              className="rounded-2xl"
            />
          </motion.div>
          <div className="absolute -inset-2 rounded-3xl bg-primary/20 blur-xl -z-10" />
        </div>

        {/* Brand name */}
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold tracking-tight"
        >
          NotLinear
        </motion.span>

        {/* Loading dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-primary"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
