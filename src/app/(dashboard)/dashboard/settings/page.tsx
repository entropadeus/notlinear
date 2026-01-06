import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/actions/settings"
import { SettingsContent } from "@/components/dashboard/settings-content"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  return <SettingsContent user={user} />
}
