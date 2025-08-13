"use client"

import { useSession } from "next-auth/react"
import { UserRole } from "@prisma/client"

interface UseAuthReturn {
  user: {
    id: string
    email: string
    name?: string | null
    role: UserRole
    image?: string | null
  } | null
  isLoading: boolean
  isAuthenticated: boolean
  hasRole: (role: UserRole | UserRole[]) => boolean
  isAdmin: boolean
  isTechnician: boolean
  isClient: boolean
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession()

  const user = session?.user || null
  const isLoading = status === "loading"
  const isAuthenticated = status === "authenticated"

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false
    if (Array.isArray(role)) {
      return role.includes(user.role)
    }
    return user.role === role
  }

  const isAdmin = hasRole("ADMIN")
  const isTechnician = hasRole("TECHNICIAN")
  const isClient = hasRole("CLIENT")

  return {
    user,
    isLoading,
    isAuthenticated,
    hasRole,
    isAdmin,
    isTechnician,
    isClient
  }
}