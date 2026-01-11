"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { Github, ArrowRight, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get("returnUrl") || "/dashboard"
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGitHubLoading, setIsGitHubLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Error",
          description: "Invalid email or password",
          variant: "destructive",
        })
      } else {
        router.push(returnUrl)
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGitHubSignIn = async () => {
    setIsGitHubLoading(true)
    await signIn("github", { callbackUrl: returnUrl })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Ambient background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Primary glow */}
        <div
          className="absolute -left-1/4 top-0 h-[600px] w-[600px] rounded-full opacity-[0.03]"
          style={{
            background: "radial-gradient(circle, hsl(16 100% 50%) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full opacity-[0.03]"
          style={{
            background: "radial-gradient(circle, hsl(16 100% 50%) 0%, transparent 70%)",
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative z-10 flex w-full max-w-[420px] flex-col items-center">
        {/* Logo and branding */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-10 flex flex-col items-center"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="relative">
              {/* Logo glow */}
              <div
                className="absolute inset-0 blur-2xl opacity-40"
                style={{ background: "hsl(16 100% 50%)" }}
              />
              <Image
                src="/notlinear-icon.png"
                alt="NotLinear"
                width={72}
                height={72}
                className="relative rounded-2xl"
                priority
              />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05, duration: 0.35 }}
            className="mt-5 text-2xl font-semibold tracking-tight"
          >
            NotLinear
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="mt-1 text-sm text-muted-foreground"
          >
            Sign in to continue
          </motion.p>
        </motion.div>

        {/* Login form card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full"
        >
          <div className="rounded-card border border-border/50 bg-card/80 p-8 shadow-card backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.12, duration: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl border-border/50 bg-background/50 px-4 transition-all focus:border-primary/50 focus:bg-background"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl border-border/50 bg-background/50 px-4 transition-all focus:border-primary/50 focus:bg-background"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.18, duration: 0.3 }}
              >
                <Button
                  type="submit"
                  className="btn-premium h-11 w-full rounded-xl text-sm font-medium"
                  disabled={isLoading || isGitHubLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="relative my-6"
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-xs uppercase tracking-wider text-muted-foreground">
                  or
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.22, duration: 0.3 }}
            >
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-xl border-border/50 bg-transparent text-sm font-medium transition-all hover:border-border hover:bg-muted/50"
                onClick={handleGitHubSignIn}
                disabled={isLoading || isGitHubLoading}
              >
                {isGitHubLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Github className="mr-2 h-4 w-4" />
                )}
                Continue with GitHub
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary transition-colors hover:text-primary/80"
          >
            Create one
          </Link>
        </motion.p>
      </div>
    </div>
  )
}

