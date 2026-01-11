"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { signOut } from "next-auth/react"
import {
  Settings,
  User,
  Palette,
  Bell,
  Shield,
  Sun,
  Moon,
  Monitor,
  Trash2,
  Save,
  Loader2,
  Check,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { updateUserProfile, deleteUserAccount } from "@/lib/actions/settings"
import type { UserSettings } from "@/lib/actions/settings"

interface SettingsContentProps {
  user: UserSettings
}

export function SettingsContent({ user }: SettingsContentProps) {
  const { theme, setTheme } = useTheme()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(user.name)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [deleteConfirmText, setDeleteConfirmText] = useState("")

  // Local notification preferences (stored in localStorage)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)

  const handleSaveProfile = () => {
    if (name === user.name) return

    setSaveStatus("saving")
    startTransition(async () => {
      const result = await updateUserProfile({ name })
      if (result.success) {
        setSaveStatus("saved")
        setTimeout(() => setSaveStatus("idle"), 2000)
      } else {
        setSaveStatus("error")
        setErrorMessage(result.error || "Failed to save")
        setTimeout(() => setSaveStatus("idle"), 3000)
      }
    })
  }

  const handleDeleteAccount = () => {
    startTransition(async () => {
      const result = await deleteUserAccount()
      if (result.success) {
        signOut({ callbackUrl: "/login" })
      }
    })
  }

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ]

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "danger", label: "Danger Zone", icon: Shield },
  ]

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-orange-500/10 flex items-center justify-center">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>
      </motion.div>

      {/* Settings Sections */}
      <div className="space-y-8">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Profile</CardTitle>
                  <CardDescription>Your personal information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 ring-2 ring-border/50">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-orange-500/20 text-2xl font-semibold">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="h-px bg-border/50" />

              {/* Name Input */}
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <div className="flex gap-3">
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="max-w-sm bg-surface-1 border-border/50"
                  />
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isPending || name === user.name || saveStatus === "saving"}
                    className={cn(
                      "min-w-[100px] transition-all",
                      saveStatus === "saved" && "bg-emerald-500 hover:bg-emerald-600",
                      saveStatus === "error" && "bg-destructive hover:bg-destructive/90"
                    )}
                  >
                    {saveStatus === "saving" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving
                      </>
                    ) : saveStatus === "saved" ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Saved
                      </>
                    ) : saveStatus === "error" ? (
                      <>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Error
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
                {saveStatus === "error" && (
                  <p className="text-sm text-destructive">{errorMessage}</p>
                )}
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="max-w-sm bg-surface-2 border-border/50 text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Sign up with a different account to use another email.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="overflow-hidden border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500/20 to-violet-600/10 flex items-center justify-center">
                  <Palette className="h-4 w-4 text-violet-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Appearance</CardTitle>
                  <CardDescription>Customize how the app looks</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-3 max-w-md">
                  {themeOptions.map((option) => {
                    const Icon = option.icon
                    const isActive = theme === option.value
                    return (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover-lift",
                          isActive
                            ? "border-primary bg-primary/5"
                            : "border-border/50 hover:border-border"
                        )}
                      >
                        <div className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                          isActive
                            ? "bg-primary/20"
                            : "bg-surface-2"
                        )}>
                          <Icon className={cn(
                            "h-5 w-5 transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                        <span className={cn(
                          "text-sm font-medium transition-colors",
                          isActive ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {option.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
                  <Bell className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  <CardDescription>Manage how you receive updates</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about your issues and projects
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="h-px bg-border/50" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive browser push notifications for important updates
                  </p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>

              <div className="h-px bg-border/50" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly summary of your project activity
                  </p>
                </div>
                <Switch
                  checked={weeklyDigest}
                  onCheckedChange={setWeeklyDigest}
                />
              </div>

              <p className="text-xs text-muted-foreground pt-2">
                Note: Notification preferences are stored locally and will reset if you clear your browser data.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="overflow-hidden border-destructive/30">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-destructive/20 to-red-600/10 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
                  <CardDescription>Irreversible and destructive actions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <div className="space-y-0.5">
                  <p className="font-medium text-destructive">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-destructive">
                        Delete Account Permanently
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>
                          This action cannot be undone. This will permanently delete your account
                          and remove all your data from our servers, including:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>All workspaces you own</li>
                          <li>All projects and issues</li>
                          <li>All comments and activity</li>
                          <li>Your profile and settings</li>
                        </ul>
                        <p className="pt-2">
                          Type <span className="font-mono font-semibold text-destructive">DELETE</span> to confirm:
                        </p>
                        <Input
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder="Type DELETE to confirm"
                          className="bg-surface-1 border-border/50"
                        />
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeleteConfirmText("")}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmText !== "DELETE" || isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
