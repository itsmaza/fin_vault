// lib/middleware/api-auth.ts
import { NextRequest } from "next/server"
import { connectDB } from "@/lib/db"
import { User } from "@/models"
import type { IUser } from "@/models/user.model"

export type ApiAuthResult =
  | { success: true; user: IUser }
  | { success: false; status: number; message: string }

export async function apiAuth(request: NextRequest): Promise<ApiAuthResult> {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      success: false,
      status:  401,
      message: "Missing Authorization header. Use: Bearer fv_live_...",
    }
  }

  const key = authHeader.replace("Bearer ", "").trim()

  if (!key.startsWith("fv_live_")) {
    return {
      success: false,
      status:  401,
      message: "Invalid API key format. Key must start with fv_live_",
    }
  }

  try {
    await connectDB()

    const user = await User.findOne({
      "apiKeys.key":      key,
      "apiKeys.isActive": true,
    })

    if (!user) {
      return {
        success: false,
        status:  401,
        message: "Invalid or inactive API key",
      }
    }

    if (user.status === "SUSPENDED") {
      return {
        success: false,
        status:  403,
        message: "Account has been suspended",
      }
    }

    if (user.status !== "ACTIVE") {
      return {
        success: false,
        status:  403,
        message: "Account is not active",
      }
    }

    // Update lastUsedAt for this specific key
    await User.updateOne(
      { "apiKeys.key": key },
      { $set: { "apiKeys.$.lastUsedAt": new Date() } }
    )

    return { success: true, user }
  } catch (error) {
    console.error("apiAuth error:", error)
    return {
      success: false,
      status:  500,
      message: "Internal server error",
    }
  }
}