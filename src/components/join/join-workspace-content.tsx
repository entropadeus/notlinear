"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Layers, Users, Shield, Crown, Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react"
import { joinWorkspaceWithToken, type InviteInfo } from "@/lib/actions/invites"

interface JoinWorkspaceContentProps {
  token: string
  inviteInfo: InviteInfo
  user: {
    name: string
    email: string
    image: string | null
  }
}

export function JoinWorkspaceContent({ token, inviteInfo, user }: JoinWorkspaceContentProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleJoin() {
    setError(null)
    startTransition(async () => {
      const result = await joinWorkspaceWithToken(token)

      if (result.success) {
        setSuccess(true)
        // Redirect after a short delay to show success state
        setTimeout(() => {
          router.push(`/w/${result.workspaceSlug}`)
        }, 1500)
      } else {
        setError(result.error)
      }
    })
  }

  function getRoleBadge(role: string) {
    switch (role) {
      case "admin":
        return (
          <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-surface-2">
            <Users className="w-3 h-3 mr-1" />
            Member
          </Badge>
        )
    }
  }

  // Show error state if invite is invalid
  if (!inviteInfo.isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-destructive/30">
            <CardHeader className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Invite Not Valid</CardTitle>
              <CardDescription className="text-destructive">
                {inviteInfo.error}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-surface-1 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-orange-500/10 flex items-center justify-center">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{inviteInfo.workspace.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {inviteInfo.workspace.description || "No description"}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/dashboard")}
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Show success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-emerald-500/30">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </motion.div>
              <CardTitle className="text-xl">Welcome to {inviteInfo.workspace.name}!</CardTitle>
              <CardDescription>
                You&apos;ve successfully joined the workspace. Redirecting...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/50">
          <CardHeader className="text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-orange-500/10 flex items-center justify-center mx-auto mb-4">
              <Layers className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Join {inviteInfo.workspace.name}</CardTitle>
            <CardDescription>
              {inviteInfo.workspace.description || "You've been invited to join this workspace"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Info */}
            <div className="p-4 rounded-lg bg-surface-1 border border-border/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                Joining as
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                {getRoleBadge(inviteInfo.role)}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Join Button */}
            <Button
              onClick={handleJoin}
              disabled={isPending}
              className="w-full btn-premium text-primary-foreground font-semibold"
              size="lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  Join Workspace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            {/* Alternative */}
            <p className="text-center text-sm text-muted-foreground">
              Not the right account?{" "}
              <a href="/login" className="text-primary hover:underline">
                Sign in with another account
              </a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
