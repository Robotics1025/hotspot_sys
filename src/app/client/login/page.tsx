"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Wifi, User, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react"

export default function ClientLogin() {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const res = await fetch('/api/auth/client', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })
            const data = await res.json()

            if (res.ok && data.success) {
                localStorage.setItem("fastnet_client_session", "active")
                localStorage.setItem("fastnet_client", JSON.stringify(data.client))
                router.push("/client")
            } else {
                setError(data.error || "Invalid credentials")
            }
        } catch {
            setError("Unable to connect. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-6 font-inter">
            <div className="w-full max-w-[440px]">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-orange-500 rounded-[22px] flex items-center justify-center mb-5 shadow-xl shadow-orange-500/30">
                        <Wifi className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 font-outfit">Client Portal</h1>
                    <p className="text-gray-500 text-sm mt-1">Log in to manage your hotspot business.</p>
                </div>

                {/* Form Card */}
                <div className="bg-white border border-gray-100 p-8 rounded-[32px] shadow-sm">
                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Error Banner */}
                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                <p className="text-sm text-red-500 font-medium">{error}</p>
                            </div>
                        )}

                        {/* Username */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Username</label>
                            <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 focus-within:bg-white focus-within:border-orange-500 transition-all">
                                <User className="w-5 h-5 text-gray-400 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="bg-transparent outline-none flex-1 text-sm font-bold"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Password</label>
                            <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 focus-within:bg-white focus-within:border-orange-500 transition-all">
                                <Lock className="w-5 h-5 text-gray-400 shrink-0" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-transparent outline-none flex-1 text-sm font-bold font-mono"
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 bg-[#111111] text-white font-bold rounded-[22px] hover:bg-orange-500 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-50 text-center">
                        <p className="text-xs text-gray-400">
                            Credentials are provided by your FastNet administrator.
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-center gap-8">
                    <Link href="/admin/login" className="text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-[3px] transition-colors">Admin Login</Link>
                    <Link href="/" className="text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-[3px] transition-colors">Return Home</Link>
                </div>
            </div>
        </div>
    )
}
