"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter()
  const isBrowser = typeof window !== "undefined"

  useEffect(() => {
    if (!isBrowser) return

    const session = window.localStorage.getItem("fastnet_session")
    if (session !== "admin_active") {
      router.replace("/admin/login")
    }
  }, [router, isBrowser])

  if (!isBrowser) {
    return null
  }

  const session = typeof window !== "undefined" ? window.localStorage.getItem("fastnet_session") : null
  if (session !== "admin_active") {
    return null
  }

  return <>{children}</>
}

