"use client"

import { useState } from "react"
import { Wifi, Ticket, Smartphone, Lock, ArrowRight, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function CaptivePortal() {
    const [method, setMethod] = useState<"voucher" | "pay">("pay")
    const [step, setStep] = useState(1)

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-6 font-inter">
            <div className="max-w-[480px] w-full bg-white rounded-[40px] shadow-2xl shadow-orange-500/10 overflow-hidden border border-gray-100">
                {/* Header Header */}
                <div className="bg-[#111111] p-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wifi className="w-32 h-32 text-white" />
                    </div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-orange-500 rounded-[22px] flex items-center justify-center mb-6 shadow-lg shadow-orange-500/40">
                            <Wifi className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white font-outfit">Welcome to FastNet</h1>
                        <p className="text-gray-400 text-sm mt-2">Connect to high-speed internet in seconds.</p>
                    </div>
                </div>

                <div className="p-10">
                    {step === 1 ? (
                        <div className="space-y-8">
                            {/* Method Selector */}
                            <div className="flex p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                                <button
                                    onClick={() => setMethod("pay")}
                                    className={cn(
                                        "flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2",
                                        method === "pay" ? "bg-white text-black shadow-md" : "text-gray-400"
                                    )}
                                >
                                    <Smartphone className="w-4 h-4" />
                                    Pay with MoMo
                                </button>
                                <button
                                    onClick={() => setMethod("voucher")}
                                    className={cn(
                                        "flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2",
                                        method === "voucher" ? "bg-white text-black shadow-md" : "text-gray-400"
                                    )}
                                >
                                    <Ticket className="w-4 h-4" />
                                    Use Voucher
                                </button>
                            </div>

                            {method === "pay" ? (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-1">Select A Plan</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { name: "1 Hour", price: "$66", desc: "Browsing" },
                                                { name: "3 Hours", price: "$56", desc: "Streaming" },
                                                { name: "1 Day", price: "$51", desc: "Unlimited" },
                                                { name: "Trial", price: "Free", desc: "5 Minutes" },
                                            ].map((plan) => (
                                                <button key={plan.name} className="p-4 bg-gray-50 border border-gray-100 rounded-3xl text-left hover:border-orange-500 hover:bg-white transition-all group">
                                                    <div className="font-bold text-gray-900 font-outfit">{plan.name}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold mb-2">{plan.desc}</div>
                                                    <div className="text-orange-500 font-black">{plan.price}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-1">Phone Number</label>
                                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 focus-within:bg-white focus-within:border-orange-500 transition-all">
                                            <Smartphone className="w-5 h-5 text-gray-400" />
                                            <input type="tel" placeholder="07XX XXX XXX" className="bg-transparent outline-none flex-1 text-sm font-bold" />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setStep(2)}
                                        className="w-full py-5 bg-[#111111] text-white font-bold rounded-[22px] hover:bg-orange-500 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 group"
                                    >
                                        <span>Pay with PesaPal</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-1">Voucher Code</label>
                                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-5 focus-within:bg-white focus-within:border-orange-500 transition-all">
                                            <Lock className="w-5 h-5 text-gray-400" />
                                            <input type="text" placeholder="Enter 8-digit code" className="bg-transparent outline-none flex-1 text-lg font-black tracking-[4px] placeholder:tracking-normal placeholder:font-medium placeholder:text-sm" />
                                        </div>
                                    </div>
                                    <button className="w-full py-5 bg-[#111111] text-white font-bold rounded-[22px] hover:bg-orange-500 transition-all shadow-xl shadow-black/10">
                                        Connect to WiFi
                                    </button>
                                    <p className="text-center text-xs text-gray-400 font-medium leading-relaxed">
                                        By connecting, you agree to our <span className="text-gray-900 font-bold">Terms of Service</span> and <span className="text-gray-900 font-bold">Privacy Policy</span>.
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-10 text-center space-y-8 flex flex-col items-center">
                            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 font-outfit mb-2">Payment Successful!</h2>
                                <p className="text-gray-500 text-sm max-w-[240px] mx-auto leading-relaxed">
                                    Your connection has been activated. Redirecting to the internet...
                                </p>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 animate-[loading_3s_ease-in-out]" />
                            </div>
                            <button
                                onClick={() => setStep(1)}
                                className="text-sm font-bold text-orange-500 hover:text-orange-600"
                            >
                                Return Home
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-8 bg-gray-50 border-t border-gray-100 text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Powered by FastNet Hotspot System</p>
                </div>
            </div>
        </div>
    )
}
