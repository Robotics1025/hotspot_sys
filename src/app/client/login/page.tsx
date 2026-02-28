"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Wifi, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react"

export default function ClientLogin() {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error ?? "Login failed. Please try again.")
                return
            }

            if (data.user?.role !== "client_admin") {
                setError("This portal is for hotspot business owners only.")
                return
            }

            router.push("/client")
        } catch {
            setError("Network error. Please check your connection.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
            {/* Background Orbs */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-[480px] relative z-10">
                {/* Logo */}
                <div className="flex flex-col items-center mb-10">
                    <Link href="/" className="flex items-center gap-2 mb-6 group transition-transform hover:scale-105">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/20">
                            <Wifi className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-3xl font-black font-outfit tracking-tighter text-white">FASTNET</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white font-outfit">Client Portal</h1>
                    <p className="text-gray-500 text-sm mt-2 text-center">Sign in to manage your hotspot business.</p>
                </div>

                {/* Card */}
                <div className="bg-white/5 border border-white/10 p-10 rounded-[40px] shadow-2xl backdrop-blur-xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="you@clients.fastnet.systems"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white text-sm outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all font-mono"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-medium">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-600 text-xs mt-6">
                    Are you platform admin?{" "}
                    <Link href="/admin/login" className="text-orange-400 hover:text-orange-300 font-bold transition-colors">
                        Admin Login →
                    </Link>
                </p>
            </div>
        </div>
    )
}
