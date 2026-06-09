// components/HeaderWrapper.tsx  ← server component
import { getSession } from "@/lib/session"
import Header from "./Header"

export default async function HeaderWrapper() {
  const session = await getSession()
  return <Header isLoggedIn={!!session} />
}