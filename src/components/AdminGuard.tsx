"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) { router.replace("/admin/login"); return }
        const data = await res.json()
        if (data?.user?.role === "super_admin") {
          setAuthorized(true)
        } else {
          router.replace("/admin/login")
        }
      })
      .catch(() => router.replace("/admin/login"))
      .finally(() => setChecked(true))
  }, [router])

  if (!checked || !authorized) return null

  return <>{children}</>
}

