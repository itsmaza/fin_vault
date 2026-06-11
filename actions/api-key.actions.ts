// actions/api-key.actions.ts
"use server"

import { connectDB } from "@/lib/db"
import { User } from "@/models"
import { requireAuth } from "@/lib/auth"
import { ok, fail } from "@/lib/response"
import { randomBytes } from "crypto"
import type { ActionResult, SafeApiKey } from "@/types"

function generateApiKey(): string {
  const random = randomBytes(24).toString("hex")
  return `fv_live_${random}`
}

// ─── Get All Keys ─────────────────────────────────────────
export async function getApiKeys(): Promise<ActionResult<SafeApiKey[]>> {
  try {
    await connectDB()
    const user = await requireAuth()

    const dbUser = await User.findById(user._id).select("apiKeys").lean()
    if (!dbUser) return fail("User not found")

    return ok("API keys fetched", dbUser.apiKeys as unknown as SafeApiKey[])
  } catch {
    return fail("Failed to fetch API keys")
  }
}

// ─── Create Key ───────────────────────────────────────────
export async function createApiKey(
  input: any
): Promise<ActionResult<SafeApiKey>> {
  try {
    await connectDB()
    const user = await requireAuth()

    const dbUser = await User.findById(user._id).select("apiKeys")
    if (!dbUser) return fail("User not found")

    if (dbUser.apiKeys.length >= 5) {
      return fail("Maximum 5 API keys allowed")
    }

    const duplicate = dbUser.apiKeys.find(
      (k) => k.name.toLowerCase() === input.name.toLowerCase()
    )
    if (duplicate) return fail("A key with this name already exists")

    const newKey = {
      key:         generateApiKey(),
      name:        input.name.trim(),
      redirectUrl: input.redirectUrl.trim(),
      webhookUrl:  input.webhookUrl?.trim() ?? null,
      isActive:    true,
    }

    dbUser.apiKeys.push(newKey as any)
    await dbUser.save()

    const created = dbUser.apiKeys[dbUser.apiKeys.length - 1]
    return ok("API key created", created.toObject() as unknown as SafeApiKey)
  } catch {
    return fail("Failed to create API key")
  }
}

// ─── Toggle Status ────────────────────────────────────────
export async function toggleApiKey(
  keyId: string
): Promise<ActionResult<{ isActive: boolean }>> {
  try {
    await connectDB()
    const user = await requireAuth()

    const dbUser = await User.findById(user._id).select("apiKeys")
    if (!dbUser) return fail("User not found")

    const key = dbUser.apiKeys.find((k) => k._id.toString() === keyId)
    if (!key) return fail("API key not found")

    key.isActive = !key.isActive
    await dbUser.save()

    return ok(
      key.isActive ? "API key enabled" : "API key disabled",
      { isActive: key.isActive }
    )
  } catch {
    return fail("Failed to update API key")
  }
}

// ─── Delete Key ───────────────────────────────────────────
export async function deleteApiKey(
  keyId: string
): Promise<ActionResult> {
  try {
    await connectDB()
    const user = await requireAuth()

    const result = await User.findByIdAndUpdate(
      user._id,
      { $pull: { apiKeys: { _id: keyId } } },
      { new: true }
    )

    if (!result) return fail("API key not found")

    return ok("API key deleted")
  } catch {
    return fail("Failed to delete API key")
  }
}