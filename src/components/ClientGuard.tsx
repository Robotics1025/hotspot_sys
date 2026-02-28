"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export interface ClientSession {
    userId: number
    email: string
    name: string
    role: string
    clientId: number | null
}

const ClientSessionContext = createContext<ClientSession | null>(null)

export function useClientSession(): ClientSession {
    const ctx = useContext(ClientSessionContext)
    if (!ctx) throw new Error("useClientSession must be used inside ClientGuard")
    return ctx
}

interface ClientGuardProps {
    children: React.ReactNode
}

export function ClientGuard({ children }: ClientGuardProps) {
    const router = useRouter()
    const [session, setSession] = useState<ClientSession | null>(null)
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        fetch("/api/auth/me")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data?.user?.role === "client_admin") {
                    setSession(data.user)
                } else {
                    router.replace("/client/login")
                }
            })
            .catch(() => router.replace("/client/login"))
            .finally(() => setChecked(true))
    }, [router])

    if (!checked || !session) return null

    return (
        <ClientSessionContext.Provider value={session}>
            {children}
        </ClientSessionContext.Provider>
    )
}
