"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-4xl space-y-8 px-4 text-center relative z-10"
      >
        <div className="relative inline-block">
          <div className="absolute inset-0 blur-3xl bg-amber-glow opacity-30 rounded-full" />
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-7xl font-heading font-bold tracking-tight text-gradient-amber"
          >
            NotLinear
          </motion.h1>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-xl text-muted-foreground font-sans max-w-2xl mx-auto"
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
            <Button size="lg" className="text-base font-semibold px-8 h-12 shadow-glow">Get Started</Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline" className="text-base font-semibold px-8 h-12">
              Sign Up
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
