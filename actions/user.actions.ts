// actions/user.actions.ts
"use server"

import { connectDB } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { ok, fail } from "@/lib/response"
import type { ActionResult, SafeUser } from "@/types"

export async function getProfile(): Promise<ActionResult<SafeUser>> {
  try {
    await connectDB()
    const user = await requireAuth()
    return ok("Profile fetched successfully", user)
  } catch {
    return fail("Unauthorized")
  }
}