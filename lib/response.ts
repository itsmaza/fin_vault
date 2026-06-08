// lib/response.ts

import { ActionResult } from "@/types"


export function ok<T>(message: string, data?: T): ActionResult<T> {
  return { success: true, message, data }
}

export function fail<T = null>(message: string): ActionResult<T> {
  return { success: false, message }
}