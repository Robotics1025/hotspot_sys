"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Search, Bell, User, LogOut, Settings as SettingsIcon, UserCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function TopBar() {
    const router = useRouter()
    const pathname = usePathname()
    const isAdmin = pathname.startsWith("/admin")
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [userName, setUserName] = useState("")
    const [userEmail, setUserEmail] = useState("")
    const [userRole, setUserRole] = useState("")
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetch("/api/auth/me")
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data?.user) {
                    setUserName(data.user.name)
                    setUserEmail(data.user.email)
                    setUserRole(data.user.role === "super_admin" ? "Platform Owner" : "Client Admin")
                }
            })
            .catch(() => {})
    }, [])

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" })
        router.replace(isAdmin ? "/admin/login" : "/client/login")
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className="h-20 flex items-center justify-between px-8 bg-white border-b border-gray-100 relative z-50">
            <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-2xl w-96 border border-gray-100 focus-within:bg-white focus-within:border-orange-500 transition-all">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search something here..."
                    className="bg-transparent border-none outline-none text-sm w-full font-medium"
                />
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden md:flex bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 text-sm font-semibold text-gray-700">
                    {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>

                <Link href="/admin/notifications" className="relative p-2 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:border-orange-500 transition-all group">
                    <Bell className="w-5 h-5 text-gray-600 group-hover:text-orange-500 transition-colors" />
                    <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
                </Link>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 pl-6 border-l border-gray-100 group hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
                    >
                        <div className="text-right hidden sm:block">
                            <h4 className="text-sm font-bold text-gray-900 leading-none mb-1 group-hover:text-orange-600 transition-colors">{userName || "—"}</h4>
                            <p className="text-[10px] text-gray-500 font-medium whitespace-nowrap">{userRole || "..."}</p>
                        </div>
                        <div className={cn(
                            "w-10 h-10 rounded-xl overflow-hidden border-2 shadow-sm transition-all",
                            isProfileOpen ? "border-orange-500 ring-4 ring-orange-500/10" : "border-white bg-gray-200"
                        )}>
                            <User className="w-full h-full p-2 text-gray-400" />
                        </div>
                    </button>

                    {/* Profile Dropdown */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-4 w-64 bg-white rounded-[24px] shadow-2xl shadow-black/10 border border-gray-50 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-5 py-3 border-b border-gray-50 mb-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Signed in as</p>
                                <p className="text-sm font-bold text-gray-900">{userEmail || "..."}</p>
                            </div>

                            <div className="px-2 space-y-1">
                                <Link
                                    href="/admin/settings"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-orange-600 rounded-2xl transition-all group"
                                >
                                    <UserCircle className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                                    Profile Settings
                                </Link>
                                <Link
                                    href="/admin/settings"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-orange-600 rounded-2xl transition-all group"
                                >
                                    <SettingsIcon className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                                    System Preferences
                                </Link>
                            </div>

                            <div className="mt-2 pt-2 border-t border-gray-50 px-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-2xl transition-all group"
                                >
                                    <LogOut className="w-5 h-5 text-rose-400 group-hover:text-rose-500" />
                                    Log Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
