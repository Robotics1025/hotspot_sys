"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react"


export default function AdminLogin() {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulate login and session storage
        setTimeout(() => {
            setIsLoading(false)
            localStorage.setItem("fastnet_session", "admin_active")
            router.push("/admin")
        }, 1500)
    }


    return (
        <div className="min-h-screen bg-[#050510] flex items-center justify-center p-6 selection:bg-purple-500/30">
            {/* Background Orbs */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-[480px] relative z-10">
                {/* Logo Area */}
                <div className="flex flex-col items-center mb-10">
                    <Link href="/" className="flex items-center gap-2 mb-6 group transition-transform hover:scale-105">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/20">
                            <Zap className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-3xl font-black font-outfit tracking-tighter text-white">FASTNET</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white font-outfit">Welcome Back, Admin</h1>
                    <p className="text-gray-500 text-sm mt-2">Enter your credentials to access the platform controller.</p>
                </div>

                {/* Login Form Card */}
                <div className="bg-white/5 border border-white/10 p-10 rounded-[40px] shadow-2xl backdrop-blur-xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Admin Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="admin@fastnet.systems"
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Password</label>
                                <Link href="#" className="text-[10px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-wider">Forgot Password?</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white text-sm outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all font-mono"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black rounded-2xl shadow-xl shadow-purple-600/20 hover:from-purple-500 hover:to-blue-500 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Sign into Console</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Info */}
                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <p className="text-gray-500 text-xs font-medium">
                            Authorized personnel only. All access attempts are logged for security verification.
                        </p>
                    </div>
                </div>

                {/* Bottom Links */}
                <div className="mt-8 flex justify-center gap-8">
                    <Link href="/" className="text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-[3px] transition-colors">Return Home</Link>
                    <Link href="#" className="text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-[3px] transition-colors">Platform Help</Link>
                </div>
            </div>
        </div>
    )
}
