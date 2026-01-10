"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { ArrowRight, Zap, GitBranch, Users, CheckCircle2, Circle, Loader2, Code2 } from "lucide-react"

// Floating Issue Card Component
function FloatingCard({
  delay,
  x,
  y,
  rotate,
  scale = 1,
  status,
  title,
  identifier
}: {
  delay: number
  x: number
  y: number
  rotate: number
  scale?: number
  status: "todo" | "in_progress" | "done"
  title: string
  identifier: string
}) {
  const statusConfig = {
    todo: { icon: Circle, color: "text-blue-400", bg: "bg-blue-500/20" },
    in_progress: { icon: Loader2, color: "text-orange-400", bg: "bg-orange-500/20" },
    done: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/20" },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        rotateX: 0,
      }}
      transition={{
        delay: delay,
        duration: 0.8,
        ease: [0.19, 1, 0.22, 1]
      }}
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `rotate(${rotate}deg) scale(${scale})`,
        transformStyle: "preserve-3d",
        perspective: "1000px"
      }}
    >
      <motion.div
        animate={{
          y: [0, -8, 0],
          rotateY: [0, 2, 0],
        }}
        transition={{
          duration: 4 + delay,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        {/* Card glow */}
        <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-transparent to-orange-500/10 rounded-3xl blur-2xl opacity-60" />

        {/* Card */}
        <div className="relative w-64 rounded-2xl border border-border/50 bg-card/90 backdrop-blur-xl p-4 shadow-2xl">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-mono text-muted-foreground">{identifier}</span>
            <div className={`p-1.5 rounded-lg ${config.bg}`}>
              <Icon className={`h-3.5 w-3.5 ${config.color} ${status === "in_progress" ? "animate-spin" : ""}`} />
            </div>
          </div>
          <p className="text-sm font-medium text-foreground line-clamp-2">{title}</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-surface-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-orange-500"
                initial={{ width: "0%" }}
                animate={{ width: status === "done" ? "100%" : status === "in_progress" ? "60%" : "20%" }}
                transition={{ delay: delay + 0.5, duration: 1 }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Animated Background Particles
function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/30"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
            opacity: 0,
          }}
          animate={{
            y: [null, -20, 20],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  )
}

// Feature card
function FeatureCard({
  icon: Icon,
  title,
  description,
  delay
}: {
  icon: React.ElementType
  title: string
  description: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative"
    >
      {/* Glow on hover */}
      <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

      <div className="relative p-6 rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm h-full">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const backgroundX = useTransform(mouseX, [0, 1], [-20, 20])
  const backgroundY = useTransform(mouseY, [0, 1], [-20, 20])
  const smoothX = useSpring(backgroundX, { stiffness: 50, damping: 20 })
  const smoothY = useSpring(backgroundY, { stiffness: 50, damping: 20 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        mouseX.set((e.clientX - rect.left) / rect.width)
        mouseY.set((e.clientY - rect.top) / rect.height)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-background overflow-hidden"
    >
      {/* Noise texture overlay */}
      <div className="noise-overlay" />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/20 blur-[120px]"
        style={{ x: smoothX, y: smoothY }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-orange-500/15 blur-[150px]"
        style={{ x: smoothX, y: smoothY }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[200px]"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Particle field */}
      <ParticleField />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Floating cards */}
      <div className="absolute inset-0 hidden lg:block">
        <FloatingCard
          delay={0.3}
          x={5}
          y={20}
          rotate={-6}
          scale={0.9}
          status="done"
          title="Implement user authentication flow"
          identifier="PROJ-142"
        />
        <FloatingCard
          delay={0.4}
          x={75}
          y={15}
          rotate={4}
          scale={0.85}
          status="in_progress"
          title="Add real-time collaboration features"
          identifier="PROJ-156"
        />
        <FloatingCard
          delay={0.5}
          x={70}
          y={60}
          rotate={-3}
          scale={0.8}
          status="todo"
          title="Design new dashboard layout"
          identifier="PROJ-163"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm text-muted-foreground">100% open source</span>
          </div>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative mb-6"
        >
          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-primary/30 rounded-full scale-150" />
            <Image
              src="/NotLinear-icon.png"
              alt="NotLinear"
              width={80}
              height={80}
              className="relative rounded-2xl shadow-2xl logo-glow"
            />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div className="text-center max-w-4xl mx-auto mb-6">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-6xl sm:text-7xl lg:text-8xl font-heading font-bold tracking-tight mb-6"
          >
            <span className="text-foreground">Ship</span>
            <span className="text-gradient-amber"> faster</span>
            <br />
            <span className="text-foreground">together</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            The <span className="text-foreground">open source</span> Linear alternative.
            <span className="text-foreground"> Self-host it</span>,
            <span className="text-foreground"> fork it</span>,
            <span className="text-foreground"> make it yours</span>.
          </motion.p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          <Link href="/register">
            <Button
              size="lg"
              className="btn-premium text-primary-foreground font-semibold px-8 h-14 text-base rounded-full group"
            >
              Start for free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="font-semibold px-8 h-14 text-base rounded-full border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:border-border"
            >
              Sign in
            </Button>
          </Link>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-5xl mx-auto"
        >
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-center text-2xl font-semibold mb-10 text-foreground"
          >
            Everything you need to ship
          </motion.h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Code2}
              title="Fully open source"
              description="No vendor lock-in. Self-host on your infra, audit the code, contribute features. Your data, your rules."
              delay={0.4}
            />
            <FeatureCard
              icon={Zap}
              title="Lightning fast"
              description="Optimistic updates and keyboard shortcuts for instant feedback. Built for speed demons."
              delay={0.45}
            />
            <FeatureCard
              icon={GitBranch}
              title="GitHub native"
              description="Link commits and PRs automatically. See code changes alongside your issues."
              delay={0.5}
            />
            <FeatureCard
              icon={Users}
              title="Real-time collab"
              description="See who's online, get instant updates. Collaboration without the refresh button."
              delay={0.55}
            />
          </div>
        </motion.div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-6 left-0 right-0 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Designed by <span className="text-foreground font-medium">entropadeus</span>
          </p>
        </motion.footer>
      </div>
    </div>
  )
}
