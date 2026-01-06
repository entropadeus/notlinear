import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SettingsContent } from "@/components/dashboard/settings-content"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  return <SettingsContent user={session.user} />
}
