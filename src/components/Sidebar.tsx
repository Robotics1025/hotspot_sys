"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Home,
    Ticket,
    LayoutDashboard,
    Router,
    Users,
    Settings,
    ChevronRight,
    LogOut
} from "lucide-react"
import { Terminal } from "lucide-react"
import { cn } from "@/lib/utils"

const clientNavItems = [
    { name: "Home", href: "/client", icon: Home },
    { name: "Vouchers", href: "/client/vouchers", icon: Ticket },
    { name: "Plans", href: "/client/plans", icon: LayoutDashboard },
]

const adminNavItems = [
    { name: "Overview", href: "/admin", icon: Home },
    { name: "Clients", href: "/admin/clients", icon: Users },
    { name: "Routers", href: "/admin/routers", icon: Router },
    { name: "Scripts", href: "/admin/scripts", icon: Terminal },
    { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const isAdmin = pathname.startsWith("/admin")
    const navItems = isAdmin ? adminNavItems : clientNavItems


    return (
        <div className="flex flex-col h-screen w-64 bg-[#111111] text-white border-r border-[#222222]">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full opacity-50" />
                </div>
                <span className="text-xl font-bold font-outfit">fastnet</span>
            </div>

            <div className="px-4 py-2 text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
                Overview
            </div>

            <nav className="flex-1 px-2 py-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-white text-black"
                                    : "text-gray-400 hover:bg-[#1a1a1a] hover:text-white"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-black" : "text-gray-400 group-hover:text-white")} />
                            <span className="font-medium">{item.name}</span>
                            {isActive && <div className="ml-auto w-1 h-4 bg-black rounded-full" />}
                        </Link>
                    )
                })}
            </nav>


        </div>
    )
}
