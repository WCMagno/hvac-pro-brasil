"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { UserRole } from "@/types"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  redirectTo = "/auth/signin" 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push(redirectTo)
      return
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(session.user.role)) {
      router.push("/")
      return
    }
  }, [session, status, requiredRoles, router, redirectTo])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(session.user.role)) {
    return null
  }

  return <>{children}</>
}