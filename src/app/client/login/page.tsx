"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
<<<<<<< HEAD
import { Wifi, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react"
=======
import { Wifi, User, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react"
>>>>>>> bbf1127d7563f500509fbd6c15b6b57c5df72eaa

export default function ClientLogin() {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
<<<<<<< HEAD
    const [error, setError] = useState<string | null>(null)
    const [email, setEmail] = useState("")
=======
    const [error, setError] = useState("")
    const [username, setUsername] = useState("")
>>>>>>> bbf1127d7563f500509fbd6c15b6b57c5df72eaa
    const [password, setPassword] = useState("")
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
<<<<<<< HEAD
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
=======
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
>>>>>>> bbf1127d7563f500509fbd6c15b6b57c5df72eaa
        } finally {
            setIsLoading(false)
        }
    }

    return (
<<<<<<< HEAD
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
=======
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
>>>>>>> bbf1127d7563f500509fbd6c15b6b57c5df72eaa
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
<<<<<<< HEAD
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
=======
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Password</label>
                            <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 focus-within:bg-white focus-within:border-orange-500 transition-all">
                                <Lock className="w-5 h-5 text-gray-400 shrink-0" />
>>>>>>> bbf1127d7563f500509fbd6c15b6b57c5df72eaa
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
<<<<<<< HEAD
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white text-sm outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all font-mono"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
=======
                                    className="bg-transparent outline-none flex-1 text-sm font-bold font-mono"
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
>>>>>>> bbf1127d7563f500509fbd6c15b6b57c5df72eaa
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

<<<<<<< HEAD
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
=======
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 bg-[#111111] text-white font-bold rounded-[22px] hover:bg-orange-500 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 group disabled:opacity-50"
>>>>>>> bbf1127d7563f500509fbd6c15b6b57c5df72eaa
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Sign In</span>
<<<<<<< HEAD
                                    <ArrowRight className="w-4 h-4" />
=======
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
>>>>>>> bbf1127d7563f500509fbd6c15b6b57c5df72eaa
                                </>
                            )}
                        </button>
                    </form>
<<<<<<< HEAD
                </div>

                <p className="text-center text-gray-600 text-xs mt-6">
                    Are you platform admin?{" "}
                    <Link href="/admin/login" className="text-orange-400 hover:text-orange-300 font-bold transition-colors">
                        Admin Login →
                    </Link>
                </p>
=======

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
>>>>>>> bbf1127d7563f500509fbd6c15b6b57c5df72eaa
            </div>
        </div>
    )
}
