// lib/api/response.ts
import { NextResponse } from "next/server"

type ApiResponse<T> = {
  success: boolean
  message: string
  data:    T | null
}

export function apiOk<T>(
  data:    T,
  message = "Success",
  status  = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { success: true, message, data },
    { status }
  )
}

export function apiError(
  message: string,
  status  = 400
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    { success: false, message, data: null },
    { status }
  )
}