"use client"

"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-4xl space-y-8 px-4 text-center"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-6xl font-bold tracking-tight"
        >
          NotLinear
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-xl text-muted-foreground"
        >
          Task management with GitHub integration. Built for speed and collaboration.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex gap-4 justify-center"
        >
          <Link href="/login">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline">
              Sign Up
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
