import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getInviteInfo } from "@/lib/actions/invites"
import { JoinWorkspaceContent } from "@/components/join/join-workspace-content"

export default async function JoinPage({
  params,
}: {
  params: { token: string }
}) {
  const session = await getServerSession(authOptions)

  // Get invite info
  const inviteInfo = await getInviteInfo(params.token)

  if (!inviteInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <svg
              className="h-8 w-8 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Invalid Invite Link</h1>
          <p className="text-muted-foreground mb-6">
            This invite link is invalid or has been deleted. Please ask for a new invite link.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    )
  }

  // If not logged in, redirect to login with return URL
  if (!session) {
    const returnUrl = encodeURIComponent(`/join/${params.token}`)
    redirect(`/login?returnUrl=${returnUrl}`)
  }

  return (
    <JoinWorkspaceContent
      token={params.token}
      inviteInfo={inviteInfo}
      user={{
        name: session.user?.name || "User",
        email: session.user?.email || "",
        image: session.user?.image || null,
      }}
    />
  )
}
