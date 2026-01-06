"use server"

import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export interface UserSettings {
  id: string
  name: string
  email: string
  image: string | null
}

export async function getCurrentUser(): Promise<UserSettings | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  return user || null
}

export async function updateUserProfile(data: { name: string }): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  if (!data.name || data.name.trim().length < 2) {
    return { success: false, error: "Name must be at least 2 characters" }
  }

  if (data.name.length > 100) {
    return { success: false, error: "Name must be less than 100 characters" }
  }

  try {
    await db
      .update(users)
      .set({
        name: data.name.trim(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id))

    revalidatePath("/dashboard/settings")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update profile" }
  }
}

export async function deleteUserAccount(): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    // The cascade delete will handle related records (workspaces, issues, etc.)
    await db.delete(users).where(eq(users.id, session.user.id))
    return { success: true }
  } catch {
    return { success: false, error: "Failed to delete account" }
  }
}
