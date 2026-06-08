// proxy.ts
import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { control_object } from "@/constant"

const publicRoutes = ["/login", "/register","/"]
const authRoutes   = ["/login", "/register"]

async function verifySession(token: string): Promise<{ userId: string } | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    return { userId: payload.userId as string }
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(control_object.COOKIE_NAME)?.value

  const isPublicRoute = publicRoutes.includes(pathname)
  const isAuthRoute   = authRoutes.includes(pathname)

  // No token
  if (!token) {
    if (isPublicRoute) return NextResponse.next()
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Verify token
  const session = await verifySession(token)

  // Invalid token
  if (!session) {
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete(control_object.COOKIE_NAME)
    return response
  }

  // Valid token + auth route → dashboard redirect
  if (isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Valid token → userId header inject
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-user-id", session.userId)

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|fonts|images).*)",
  ],
}