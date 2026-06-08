// lib/auth.ts
import { getSession } from "@/lib/session"
import { connectDB } from "@/lib/db"
import { SafeUser } from "@/types"
import { User } from "@/models"

export async function getCurrentUser(): Promise<SafeUser | null> {
  const session = await getSession()
  if (!session) return null

  try {
    await connectDB()
    const user = await User.findById(session.userId)
      .select("-passcode -resetPinToken -resetPinExpires")
      .lean()

    if (!user) return null
    return user as unknown as SafeUser
  } catch {
    return null
  }
}

export async function requireAuth(): Promise<SafeUser> {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")
  return user
}

export async function requireActiveUser(): Promise<SafeUser> {
  const user = await requireAuth()
  if (user.status !== "ACTIVE") throw new Error("Account not active")
  return user
}