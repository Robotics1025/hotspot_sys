"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Wifi, ArrowRight, Loader2, ChevronLeft, Phone, User, AlertCircle } from "lucide-react"

interface Plan {
    id: number
    name: string
    duration: number
    speedLimit: string | null
    price: string
}

interface PortalData {
    client: { id: number; name: string }
    router: { id: number; name: string }
    plans: Plan[]
}

function formatDuration(seconds: number): { label: string; short: string } {
    if (seconds < 3600) { const m = Math.round(seconds / 60); return { label: `${m} Min`, short: `${m}M` } }
    if (seconds < 86400) { const h = Math.round(seconds / 3600); return { label: `${h}H`, short: `${h}H` } }
    if (seconds < 604800) { const d = Math.round(seconds / 86400); return { label: `${d}D`, short: `${d}D` } }
    if (seconds < 2592000) { const w = Math.round(seconds / 604800); return { label: `${w * 7}D`, short: `${w * 7}D` } }
    const mo = Math.round(seconds / 2592000); return { label: `${mo * 30}D`, short: `${mo * 30}D` }
}

function planCategoryLabel(name: string): string {
    const n = name.toUpperCase()
    if (n.includes("1 HOUR") || n.includes("1H")) return "HOURLY"
    if (n.includes("3 DAY") || n.includes("3D")) return "3-DAY"
    if (n.includes("7 DAY") || n.includes("7D") || n.includes("WEEK")) return "WEEKLY"
    if (n.includes("30 DAY") || n.includes("30D") || n.includes("MONTH")) return "MONTHLY"
    return n
}

function isBestValue(name: string): boolean {
    return name === "3 Days" || name.toLowerCase().includes("3 day")
}


function PortalContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const routerId = searchParams.get("router_id") ?? "1"

    const [data, setData] = useState<PortalData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
    const [customerName, setCustomerName] = useState("")
    const [customerPhone, setCustomerPhone] = useState("")
    const [paying, setPaying] = useState(false)
    const [payError, setPayError] = useState("")

    useEffect(() => {
        fetch(`/api/portal/plans?router_id=${routerId}`)
            .then(r => r.json())
            .then(d => {
                if (d.error) { setError(d.error); setLoading(false); return }
                setData(d)
                setLoading(false)
            })
            .catch(() => { setError("Failed to load plans. Please try again."); setLoading(false) })
    }, [routerId])

    async function handlePay() {
        if (!selectedPlan || !customerName.trim() || !customerPhone.trim()) return
        setPaying(true)
        setPayError("")
        try {
            const res = await fetch("/api/portal/pay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plan_id: selectedPlan.id,
                    router_id: parseInt(routerId),
                    customer_name: customerName.trim(),
                    customer_phone: customerPhone.trim(),
                }),
            })
            const result = await res.json()
            if (!res.ok || result.error) {
                setPayError(result.error ?? "Payment failed. Please try again.")
                setPaying(false)
                return
            }
            // Redirect to PesaPal or mock complete page
            window.location.href = result.redirect_url
        } catch {
            setPayError("Network error. Please try again.")
            setPaying(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                    <h2 className="text-white text-2xl font-bold mb-2">Connection Error</h2>
                    <p className="text-gray-400">{error || "Unable to load hotspot plans."}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white">
            {/* Header */}
            <div className="px-6 pt-12 pb-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                        <Wifi className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white">{data.client.name}</h1>
                        <p className="text-xs text-gray-500 font-medium">via {data.router.name}</p>
                    </div>
                </div>

                {!selectedPlan ? (
                    <>
                        <h2 className="text-3xl font-black leading-tight mb-2">Get WiFi Access</h2>
                        <p className="text-gray-400 text-sm">Choose a plan that works for you</p>
                    </>
                ) : (
                    <button
                        onClick={() => { setSelectedPlan(null); setPayError("") }}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-semibold"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to plans
                    </button>
                )}
            </div>

            {/* Plan Selection */}
            {!selectedPlan && (
                <div className="px-6 pb-12">
                    {data.plans.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500">No plans available at this location.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data.plans.map((plan) => {
                                const dur = formatDuration(plan.duration)
                                const best = isBestValue(plan.name)
                                return (
                                    <button
                                        key={plan.id}
                                        onClick={() => setSelectedPlan(plan)}
                                        className="w-full text-left active:scale-[0.98] transition-transform"
                                    >
                                        <div className="bg-[#1A1A1A] border border-[#2A2A2A] hover:border-orange-500/40 rounded-2xl px-5 py-5 flex items-center gap-4 transition-colors">
                                            {/* Duration block */}
                                            <div className="min-w-[56px] text-center">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">{planCategoryLabel(plan.name)}</p>
                                                <p className="text-xl font-black text-white mt-0.5">{dur.label}</p>
                                            </div>

                                            {/* Divider */}
                                            <div className="w-px h-10 bg-[#2A2A2A]" />

                                            {/* Price */}
                                            <div className="flex-1">
                                                <span className="text-3xl font-black text-white">{parseFloat(plan.price).toLocaleString()}</span>
                                                <span className="text-gray-400 font-bold text-base ml-2">UGX</span>
                                            </div>

                                            {/* Best Value badge */}
                                            {best && (
                                                <span className="px-3 py-1.5 bg-amber-400 text-black text-xs font-black rounded-full whitespace-nowrap">
                                                    Best Value
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Payment Form */}
            {selectedPlan && (
                <div className="px-6 pb-12">
                    {/* Selected plan summary */}
                    <div className="bg-[#1A1A1A] border border-orange-500/30 rounded-2xl px-5 py-5 flex items-center gap-4 mb-8">
                        <div className="min-w-[56px] text-center">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">{planCategoryLabel(selectedPlan.name)}</p>
                            <p className="text-xl font-black text-white mt-0.5">{formatDuration(selectedPlan.duration).label}</p>
                        </div>
                        <div className="w-px h-10 bg-[#2A2A2A]" />
                        <div className="flex-1">
                            <span className="text-3xl font-black text-white">{parseFloat(selectedPlan.price).toLocaleString()}</span>
                            <span className="text-gray-400 font-bold text-base ml-2">UGX</span>
                        </div>
                        {isBestValue(selectedPlan.name) && (
                            <span className="px-3 py-1.5 bg-amber-400 text-black text-xs font-black rounded-full">Best Value</span>
                        )}
                    </div>

                    {/* Input fields */}
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Your Name</label>
                            <div className="flex items-center gap-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl px-4 py-4 focus-within:border-orange-500 transition-colors">
                                <User className="w-5 h-5 text-gray-500 shrink-0" />
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={e => setCustomerName(e.target.value)}
                                    placeholder="John Doe"
                                    className="bg-transparent outline-none text-white w-full font-medium placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Mobile Money Number</label>
                            <div className="flex items-center gap-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl px-4 py-4 focus-within:border-orange-500 transition-colors">
                                <Phone className="w-5 h-5 text-gray-500 shrink-0" />
                                <input
                                    type="tel"
                                    value={customerPhone}
                                    onChange={e => setCustomerPhone(e.target.value)}
                                    placeholder="07XXXXXXXX or 256XXXXXXXXX"
                                    className="bg-transparent outline-none text-white w-full font-medium placeholder:text-gray-600"
                                />
                            </div>
                        </div>
                    </div>

                    {payError && (
                        <div className="flex items-center gap-2 text-rose-400 text-sm mb-4 bg-rose-500/10 rounded-2xl px-4 py-3">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {payError}
                        </div>
                    )}

                    <button
                        onClick={handlePay}
                        disabled={paying || !customerName.trim() || !customerPhone.trim()}
                        className="w-full py-5 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-orange-500/30 flex items-center justify-center gap-3"
                    >
                        {paying ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Pay UGX {parseFloat(selectedPlan.price).toLocaleString()}
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-gray-600 mt-4">
                        Secured by PesaPal · Airtel Money &amp; MTN Mobile Money accepted
                    </p>
                </div>
            )}
        </div>
    )
}

export default function PortalPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            </div>
        }>
            <PortalContent />
        </Suspense>
    )
}
