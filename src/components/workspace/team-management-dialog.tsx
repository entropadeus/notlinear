"use client"

import { useState, useEffect, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import {
  Users,
  Link2,
  Plus,
  Copy,
  Check,
  MoreHorizontal,
  Trash2,
  Shield,
  UserMinus,
  Crown,
  Loader2,
  Clock,
  RefreshCw,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import {
  createInviteToken,
  getWorkspaceInvites,
  getWorkspaceMembers,
  revokeInvite,
  updateMemberRole,
  removeMember,
  type WorkspaceInvite,
} from "@/lib/actions/invites"

interface TeamManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspace: {
    id: string
    name: string
    slug: string
  }
  currentUserRole: "owner" | "admin" | "member"
}

type Member = {
  id: string
  userId: string
  role: string
  joinedAt: Date
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
}

export function TeamManagementDialog({
  open,
  onOpenChange,
  workspace,
  currentUserRole,
}: TeamManagementDialogProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState("members")

  // Members state
  const [members, setMembers] = useState<Member[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)

  // Invites state
  const [invites, setInvites] = useState<WorkspaceInvite[]>([])
  const [loadingInvites, setLoadingInvites] = useState(false)

  // Create invite state
  const [showCreateInvite, setShowCreateInvite] = useState(false)
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member")
  const [inviteMaxUses, setInviteMaxUses] = useState<string>("")
  const [inviteExpiresDays, setInviteExpiresDays] = useState<string>("7")

  // Copied state
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  // Confirmation dialogs
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null)
  const [inviteToRevoke, setInviteToRevoke] = useState<WorkspaceInvite | null>(null)

  const isAdmin = currentUserRole === "owner" || currentUserRole === "admin"

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      loadMembers()
      if (isAdmin) {
        loadInvites()
      }
    }
  }, [open, workspace.id, isAdmin])

  async function loadMembers() {
    setLoadingMembers(true)
    try {
      const data = await getWorkspaceMembers(workspace.id)
      setMembers(data)
    } catch (error) {
      toast({ title: "Failed to load members", variant: "destructive" })
    }
    setLoadingMembers(false)
  }

  async function loadInvites() {
    setLoadingInvites(true)
    try {
      const data = await getWorkspaceInvites(workspace.id)
      setInvites(data)
    } catch (error) {
      toast({ title: "Failed to load invites", variant: "destructive" })
    }
    setLoadingInvites(false)
  }

  function handleCreateInvite() {
    startTransition(async () => {
      const result = await createInviteToken({
        workspaceId: workspace.id,
        role: inviteRole,
        maxUses: inviteMaxUses ? parseInt(inviteMaxUses, 10) : null,
        expiresInDays: inviteExpiresDays ? parseInt(inviteExpiresDays, 10) : null,
      })

      if (result.success) {
        toast({ title: "Invite created successfully" })
        setShowCreateInvite(false)
        setInviteRole("member")
        setInviteMaxUses("")
        setInviteExpiresDays("7")
        loadInvites()
      } else {
        toast({ title: result.error, variant: "destructive" })
      }
    })
  }

  function copyInviteLink(token: string) {
    const link = `${window.location.origin}/join/${token}`
    navigator.clipboard.writeText(link)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
    toast({ title: "Invite link copied to clipboard" })
  }

  function handleRevokeInvite() {
    if (!inviteToRevoke) return

    startTransition(async () => {
      const result = await revokeInvite(inviteToRevoke.id)
      if (result.success) {
        toast({ title: "Invite revoked" })
        loadInvites()
      } else {
        toast({ title: result.error || "Failed to revoke invite", variant: "destructive" })
      }
      setInviteToRevoke(null)
    })
  }

  function handleUpdateRole(memberId: string, newRole: "admin" | "member") {
    startTransition(async () => {
      const result = await updateMemberRole(memberId, newRole)
      if (result.success) {
        toast({ title: "Role updated" })
        loadMembers()
      } else {
        toast({ title: result.error || "Failed to update role", variant: "destructive" })
      }
    })
  }

  function handleRemoveMember() {
    if (!memberToRemove) return

    startTransition(async () => {
      const result = await removeMember(memberToRemove.id)
      if (result.success) {
        toast({ title: "Member removed" })
        loadMembers()
      } else {
        toast({ title: result.error || "Failed to remove member", variant: "destructive" })
      }
      setMemberToRemove(null)
    })
  }

  function getRoleBadge(role: string) {
    switch (role) {
      case "owner":
        return (
          <Badge variant="default" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Crown className="w-3 h-3 mr-1" />
            Owner
          </Badge>
        )
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
            Member
          </Badge>
        )
    }
  }

  function isInviteExpired(invite: WorkspaceInvite): boolean {
    if (!invite.expiresAt) return false
    return new Date(invite.expiresAt) < new Date()
  }

  function isInviteMaxedOut(invite: WorkspaceInvite): boolean {
    if (invite.maxUses === null) return false
    return invite.usedCount >= invite.maxUses
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl glass">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Management
            </DialogTitle>
            <DialogDescription>
              Manage members and invite links for {workspace.name}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="members" className="gap-2">
                <Users className="h-4 w-4" />
                Members ({members.length})
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="invites" className="gap-2">
                  <Link2 className="h-4 w-4" />
                  Invite Links ({invites.length})
                </TabsTrigger>
              )}
            </TabsList>

            {/* Members Tab */}
            <TabsContent value="members" className="mt-4">
              {loadingMembers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  <AnimatePresence mode="popLayout">
                    {members.map((member, index) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-surface-1 border border-border/50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.user.image || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {member.user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.user.name}</p>
                            <p className="text-sm text-muted-foreground">{member.user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getRoleBadge(member.role)}
                          {isAdmin && member.role !== "owner" && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="glass">
                                {member.role === "member" ? (
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateRole(member.id, "admin")}
                                  >
                                    <Shield className="mr-2 h-4 w-4" />
                                    Make Admin
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateRole(member.id, "member")}
                                  >
                                    <UserMinus className="mr-2 h-4 w-4" />
                                    Remove Admin
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => setMemberToRemove(member)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove from workspace
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>

            {/* Invites Tab */}
            {isAdmin && (
              <TabsContent value="invites" className="mt-4 space-y-4">
                {/* Create Invite Section */}
                <AnimatePresence mode="wait">
                  {showCreateInvite ? (
                    <motion.div
                      key="create-form"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 rounded-lg bg-surface-1 border border-border/50 space-y-4"
                    >
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Select
                            value={inviteRole}
                            onValueChange={(v) => setInviteRole(v as "member" | "admin")}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Max Uses</Label>
                          <Input
                            type="number"
                            placeholder="Unlimited"
                            min="1"
                            value={inviteMaxUses}
                            onChange={(e) => setInviteMaxUses(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Expires In (days)</Label>
                          <Input
                            type="number"
                            placeholder="Never"
                            min="1"
                            value={inviteExpiresDays}
                            onChange={(e) => setInviteExpiresDays(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => setShowCreateInvite(false)}
                          disabled={isPending}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleCreateInvite} disabled={isPending}>
                          {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="mr-2 h-4 w-4" />
                          )}
                          Create Invite
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="create-button"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Button
                        onClick={() => setShowCreateInvite(true)}
                        className="w-full"
                        variant="outline"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Invite Link
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Invites List */}
                {loadingInvites ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : invites.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Link2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No active invite links</p>
                    <p className="text-sm">Create one to invite team members</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    <AnimatePresence mode="popLayout">
                      {invites.map((invite, index) => {
                        const expired = isInviteExpired(invite)
                        const maxedOut = isInviteMaxedOut(invite)
                        const inactive = expired || maxedOut

                        return (
                          <motion.div
                            key={invite.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-3 rounded-lg border ${
                              inactive
                                ? "bg-surface-2/50 border-border/30 opacity-60"
                                : "bg-surface-1 border-border/50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <code className="text-sm font-mono bg-surface-2 px-2 py-0.5 rounded truncate">
                                      {invite.token}
                                    </code>
                                    {getRoleBadge(invite.role)}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {invite.usedCount}
                                      {invite.maxUses !== null && `/${invite.maxUses}`} uses
                                    </span>
                                    {invite.expiresAt && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {expired
                                          ? "Expired"
                                          : `Expires ${formatDistanceToNow(new Date(invite.expiresAt), { addSuffix: true })}`}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => copyInviteLink(invite.token)}
                                  disabled={inactive}
                                >
                                  {copiedToken === invite.token ? (
                                    <Check className="h-4 w-4 text-emerald-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => setInviteToRevoke(invite)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                )}

                {invites.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={loadInvites}
                    disabled={loadingInvites}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${loadingInvites ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                )}
              </TabsContent>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent className="glass">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.user.name} from this workspace?
              They will lose access to all projects and issues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke Invite Confirmation */}
      <AlertDialog open={!!inviteToRevoke} onOpenChange={() => setInviteToRevoke(null)}>
        <AlertDialogContent className="glass">
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Invite</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke this invite link? Anyone with this link will no
              longer be able to join the workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeInvite}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
