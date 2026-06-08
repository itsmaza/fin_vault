// lib/db.ts
import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables")
}

declare global {
  var _mongooseConn: typeof mongoose | null
}

let cached = global._mongooseConn ?? null

export async function connectDB(): Promise<typeof mongoose> {
  if (cached) return cached

  try {
    cached = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    })

    global._mongooseConn = cached
    console.log("✅ MongoDB connected")
    return cached
  } catch (error) {
    cached = null
    global._mongooseConn = null
    console.error("❌ MongoDB connection failed:", error)
    throw new Error("Database connection failed. Please try again later.")
  }
}