"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Wifi, CheckCircle2, Loader2, AlertCircle, Copy, Check, RefreshCw, XCircle } from "lucide-react"

type PaymentStatus = "loading" | "completed" | "pending" | "failed" | "no_vouchers" | "error"

function CompleteContent() {
    const searchParams = useSearchParams()
    const ref = searchParams.get("ref") ?? searchParams.get("OrderMerchantReference") ?? ""
    const trackingId = searchParams.get("OrderTrackingId") ?? ""
    const mock = searchParams.get("mock") ?? ""

    const [status, setStatus] = useState<PaymentStatus>("loading")
    const [voucherCode, setVoucherCode] = useState("")
    const [copied, setCopied] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")

    async function checkPayment() {
        setStatus("loading")
        try {
            const params = new URLSearchParams({ ref })
            if (trackingId) params.set("tracking_id", trackingId)
            if (mock) params.set("mock", mock)

            const res = await fetch(`/api/portal/complete?${params}`)
            const data = await res.json()

            if (data.status === "completed") {
                setVoucherCode(data.voucher_code ?? "")
                setStatus("completed")
            } else if (data.status === "pending") {
                setStatus("pending")
            } else if (data.status === "no_vouchers") {
                setStatus("no_vouchers")
            } else {
                setErrorMsg(data.error ?? "Payment verification failed.")
                setStatus("error")
            }
        } catch {
            setErrorMsg("Network error. Please try again.")
            setStatus("error")
        }
    }

    useEffect(() => {
        if (ref) checkPayment()
        else setStatus("error")
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref])

    function copyCode() {
        navigator.clipboard.writeText(voucherCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
            {/* Header */}
            <div className="px-6 pt-12 pb-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <Wifi className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-black">FastNet</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
                {/* Loading */}
                {status === "loading" && (
                    <div className="text-center">
                        <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Verifying Payment</h2>
                        <p className="text-gray-400 text-sm">Please wait a moment...</p>
                    </div>
                )}

                {/* Success */}
                {status === "completed" && (
                    <div className="w-full max-w-sm text-center">
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-black mb-2">Payment Successful!</h2>
                        <p className="text-gray-400 text-sm mb-8">Your WiFi voucher code is ready. Enter it in the login screen.</p>

                        {/* Voucher Code */}
                        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-3xl p-8 mb-6">
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Your Voucher Code</p>
                            <div className="text-4xl font-black tracking-[0.2em] text-orange-400 mb-6 font-mono">
                                {voucherCode}
                            </div>
                            <button
                                onClick={copyCode}
                                className="w-full py-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                            >
                                {copied ? (
                                    <><Check className="w-4 h-4" /> Copied!</>
                                ) : (
                                    <><Copy className="w-4 h-4" /> Copy Code</>
                                )}
                            </button>
                        </div>

                        <div className="bg-[#111] border border-[#1E1E1E] rounded-2xl p-5 text-left space-y-3">
                            <p className="text-xs font-black text-gray-500 uppercase tracking-wider">How to connect</p>
                            <div className="flex gap-3">
                                <span className="w-6 h-6 bg-orange-500 rounded-full text-xs font-black flex items-center justify-center shrink-0">1</span>
                                <p className="text-sm text-gray-300">Open your browser — you&apos;ll be redirected to the login page</p>
                            </div>
                            <div className="flex gap-3">
                                <span className="w-6 h-6 bg-orange-500 rounded-full text-xs font-black flex items-center justify-center shrink-0">2</span>
                                <p className="text-sm text-gray-300">Enter the voucher code above in the username field</p>
                            </div>
                            <div className="flex gap-3">
                                <span className="w-6 h-6 bg-orange-500 rounded-full text-xs font-black flex items-center justify-center shrink-0">3</span>
                                <p className="text-sm text-gray-300">Click &quot;Login&quot; and enjoy your WiFi session!</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pending */}
                {status === "pending" && (
                    <div className="w-full max-w-sm text-center">
                        <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <RefreshCw className="w-10 h-10 text-amber-400" />
                        </div>
                        <h2 className="text-2xl font-black mb-2">Payment Pending</h2>
                        <p className="text-gray-400 text-sm mb-8">We&apos;re waiting for your M-Pesa confirmation. Complete the STK push prompt on your phone.</p>
                        <button
                            onClick={checkPayment}
                            className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Check Again
                        </button>
                    </div>
                )}

                {/* No Vouchers */}
                {status === "no_vouchers" && (
                    <div className="w-full max-w-sm text-center">
                        <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10 text-amber-400" />
                        </div>
                        <h2 className="text-2xl font-black mb-2">No Vouchers Available</h2>
                        <p className="text-gray-400 text-sm">Payment received but all vouchers for this plan are used. Please contact the hotspot operator for assistance.</p>
                    </div>
                )}

                {/* Error */}
                {(status === "error" || status === "failed") && (
                    <div className="w-full max-w-sm text-center">
                        <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-10 h-10 text-rose-400" />
                        </div>
                        <h2 className="text-2xl font-black mb-2">Something Went Wrong</h2>
                        <p className="text-gray-400 text-sm mb-6">{errorMsg || "Payment could not be verified."}</p>
                        <button
                            onClick={checkPayment}
                            className="w-full py-4 bg-[#1A1A1A] hover:bg-[#222] border border-[#2A2A2A] text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function CompletePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            </div>
        }>
            <CompleteContent />
        </Suspense>
    )
}
