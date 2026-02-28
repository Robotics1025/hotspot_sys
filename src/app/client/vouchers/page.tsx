"use client"

import { useState, useEffect, useRef } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { ClientGuard } from "@/components/ClientGuard"
import { Ticket, Search, Plus, Download, MoreVertical, Loader2, X, AlertCircle, CheckCircle2, Ban } from "lucide-react"
import { cn } from "@/lib/utils"

interface Voucher {
    id: number
    code: string
    status: "unused" | "active" | "expired" | "disabled"
    consumedAt: string | null
    expiresAt: string | null
    createdAt: string
    planId: number | null
    planName: string | null
    planPrice: string | null
    planDuration: number | null
}

interface Plan {
    id: number
    name: string
    price: string
    duration: number
}

const STATUS_STYLES: Record<string, string> = {
    unused:   "bg-blue-50 text-blue-600 border-blue-100",
    active:   "bg-emerald-50 text-emerald-600 border-emerald-100",
    expired:  "bg-gray-50 text-gray-400 border-gray-100",
    disabled: "bg-rose-50 text-rose-400 border-rose-100",
}

function formatDate(d: string | null) {
    if (!d) return "—"
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function formatDuration(s: number): string {
    if (s % 86400 === 0) return `${s / 86400}d`
    if (s % 3600 === 0)  return `${s / 3600}h`
    return `${Math.round(s / 60)}m`
}

function VouchersContent() {
    const [activeTab, setActiveTab]   = useState("all")
    const [vouchers, setVouchers]     = useState<Voucher[]>([])
    const [search, setSearch]         = useState("")
    const [isLoading, setIsLoading]   = useState(true)

    // Generate modal
    const [showModal, setShowModal]   = useState(false)
    const [plans, setPlans]           = useState<Plan[]>([])
    const [selPlanId, setSelPlanId]   = useState("")
    const [quantity, setQuantity]     = useState("10")
    const [generating, setGenerating] = useState(false)
    const [genError, setGenError]     = useState("")
    const [genSuccess, setGenSuccess] = useState("")

    // Row menu
    const [openMenuId, setOpenMenuId] = useState<number | null>(null)
    const [disablingId, setDisablingId] = useState<number | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => { fetchVouchers("all") }, [])

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    async function fetchVouchers(tab: string) {
        setIsLoading(true)
        try {
            const url = tab === "all" ? "/api/client/vouchers" : `/api/client/vouchers?status=${tab}`
            const res = await fetch(url)
            const data = await res.json()
            setVouchers(Array.isArray(data) ? data : [])
        } catch { setVouchers([]) }
        finally { setIsLoading(false) }
    }

    function handleTabChange(tab: string) {
        setActiveTab(tab)
        fetchVouchers(tab)
    }

    async function openGenerate() {
        setGenError(""); setGenSuccess(""); setSelPlanId(""); setQuantity("10")
        setShowModal(true)
        try {
            const res = await fetch("/api/client/plans")
            const data = await res.json()
            setPlans(Array.isArray(data) ? data : [])
            if (data.length > 0) setSelPlanId(String(data[0].id))
        } catch { setPlans([]) }
    }

    async function handleGenerate(e: React.FormEvent) {
        e.preventDefault()
        if (!selPlanId) { setGenError("Select a plan"); return }
        const qty = parseInt(quantity)
        if (!qty || qty < 1 || qty > 500) { setGenError("Quantity must be 1–500"); return }

        setGenerating(true); setGenError(""); setGenSuccess("")
        try {
            const res = await fetch("/api/client/vouchers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId: parseInt(selPlanId), quantity: qty }),
            })
            const data = await res.json()
            if (!res.ok) { setGenError(data.error ?? "Failed to generate"); return }
            setGenSuccess(`✓ ${qty} voucher${qty > 1 ? "s" : ""} generated successfully`)
            fetchVouchers(activeTab)
        } catch { setGenError("Network error. Please try again.") }
        finally { setGenerating(false) }
    }

    async function handleDisable(voucherId: number) {
        if (!confirm("Disable this voucher? It won't be usable.")) return
        setDisablingId(voucherId)
        setOpenMenuId(null)
        try {
            const res = await fetch(`/api/client/vouchers?id=${voucherId}`, { method: "DELETE" })
            if (res.ok) {
                setVouchers(prev => prev.map(v => v.id === voucherId ? { ...v, status: "disabled" } : v))
            }
        } catch {}
        finally { setDisablingId(null) }
    }

    function exportCSV() {
        const rows = [["Code", "Plan", "Status", "Created", "Used At", "Expires At"]]
        filtered.forEach(v => rows.push([
            v.code, v.planName ?? "", v.status,
            formatDate(v.createdAt), formatDate(v.consumedAt), formatDate(v.expiresAt)
        ]))
        const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n")
        const blob = new Blob([csv], { type: "text/csv" })
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob)
        a.download = `vouchers-${activeTab}-${Date.now()}.csv`; a.click()
    }

    const filtered = vouchers.filter(v =>
        !search || v.code.toLowerCase().includes(search.toLowerCase()) || (v.planName ?? "").toLowerCase().includes(search.toLowerCase())
    )

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-gray-900">Voucher Management</h1>
                        <p className="text-gray-500 text-sm mt-1">Generate and track internet vouchers for your customers.</p>
                    </div>
                    <button
                        onClick={openGenerate}
                        className="flex items-center gap-2 px-6 py-3 bg-[#111111] text-white font-bold rounded-2xl hover:bg-orange-500 transition-all shadow-lg shadow-black/10"
                    >
                        <Plus className="w-5 h-5" />
                        Generate Vouchers
                    </button>
                </div>

                {/* Filters bar */}
                <div className="flex items-center justify-between bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm gap-4 flex-wrap">
                    <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-100">
                        {["all", "unused", "active", "expired", "disabled"].map(tab => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={cn(
                                    "px-5 py-2 text-sm font-bold rounded-xl transition-all capitalize",
                                    activeTab === tab ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 focus-within:bg-white transition-all">
                            <Search className="w-4 h-4 text-gray-400 shrink-0" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search code or plan..."
                                className="bg-transparent border-none outline-none text-xs font-medium w-44"
                            />
                        </div>
                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-600 text-xs font-bold rounded-xl border border-gray-100 hover:bg-white transition-all"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] text-gray-500 uppercase font-black">
                                <th className="px-8 py-5">Voucher Code</th>
                                <th className="px-6 py-5">Plan</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5">Created</th>
                                <th className="px-6 py-5">Used At</th>
                                <th className="px-6 py-5">Expires At</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr><td colSpan={7} className="px-8 py-16 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-orange-500 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400 font-bold">Loading vouchers...</p>
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={7} className="px-8 py-16 text-center">
                                    <Ticket className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                    <p className="text-sm font-bold text-gray-400">No vouchers found</p>
                                    <p className="text-xs text-gray-300 mt-1">Generate some to get started</p>
                                </td></tr>
                            ) : filtered.map(voucher => (
                                <tr key={voucher.id} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
                                                <Ticket className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-gray-900 font-mono text-sm tracking-wider">{voucher.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div>
                                            <p className="text-sm font-bold text-gray-700">{voucher.planName ?? "—"}</p>
                                            {voucher.planDuration && (
                                                <p className="text-xs text-gray-400">{formatDuration(voucher.planDuration)} · UGX {parseFloat(voucher.planPrice ?? "0").toLocaleString()}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={cn("px-2.5 py-1 text-[10px] font-black uppercase rounded-full border", STATUS_STYLES[voucher.status] ?? STATUS_STYLES.expired)}>
                                            {voucher.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-xs text-gray-500 font-medium">{formatDate(voucher.createdAt)}</td>
                                    <td className="px-6 py-5 text-xs text-gray-500 font-medium">{formatDate(voucher.consumedAt)}</td>
                                    <td className="px-6 py-5 text-xs text-gray-500 font-medium">{formatDate(voucher.expiresAt)}</td>
                                    <td className="px-8 py-5 text-right relative">
                                        {voucher.status === "unused" && (
                                            <div className="relative inline-block" ref={openMenuId === voucher.id ? menuRef : undefined}>
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === voucher.id ? null : voucher.id)}
                                                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                                                >
                                                    {disablingId === voucher.id
                                                        ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                                        : <MoreVertical className="w-4 h-4 text-gray-400" />
                                                    }
                                                </button>
                                                {openMenuId === voucher.id && (
                                                    <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-1">
                                                        <button
                                                            onClick={() => handleDisable(voucher.id)}
                                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors rounded-2xl"
                                                        >
                                                            <Ban className="w-4 h-4" /> Disable
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="px-8 py-4 bg-gray-50/30 border-t border-gray-50">
                        <p className="text-xs text-gray-400 font-bold">
                            {filtered.length} voucher{filtered.length !== 1 ? "s" : ""}
                            {search && ` matching "${search}"`}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Generate Vouchers slide-over ─────────────────────────────── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-bold font-outfit text-gray-900">Generate Vouchers</h2>
                                <p className="text-sm text-gray-400 mt-0.5">Create a batch of unused voucher codes</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleGenerate} className="flex flex-col flex-1 px-8 py-6 gap-5 overflow-y-auto">
                            {/* Plan select */}
                            <div>
                                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">Plan *</label>
                                {plans.length === 0 ? (
                                    <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 rounded-2xl px-4 py-3">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        No plans found. Create a plan first.
                                    </div>
                                ) : (
                                    <select
                                        value={selPlanId}
                                        onChange={e => setSelPlanId(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                                    >
                                        {plans.map(p => (
                                            <option key={p.id} value={String(p.id)}>
                                                {p.name} — UGX {parseFloat(p.price).toLocaleString()}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">Quantity *</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="500"
                                    value={quantity}
                                    onChange={e => setQuantity(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                                />
                                <p className="text-xs text-gray-400 mt-1.5">Max 500 per batch</p>
                            </div>

                            {/* Quick qty buttons */}
                            <div className="flex gap-2">
                                {[10, 25, 50, 100].map(n => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => setQuantity(String(n))}
                                        className={cn(
                                            "flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                                            quantity === String(n)
                                                ? "bg-orange-500 text-white border-orange-500"
                                                : "bg-gray-50 text-gray-500 border-gray-200 hover:border-orange-300"
                                        )}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>

                            {genError && (
                                <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-50 rounded-2xl px-4 py-3">
                                    <AlertCircle className="w-4 h-4 shrink-0" /> {genError}
                                </div>
                            )}
                            {genSuccess && (
                                <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 rounded-2xl px-4 py-3">
                                    <CheckCircle2 className="w-4 h-4 shrink-0" /> {genSuccess}
                                </div>
                            )}

                            <div className="mt-auto pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3.5 border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                                >
                                    {genSuccess ? "Close" : "Cancel"}
                                </button>
                                {!genSuccess && (
                                    <button
                                        type="submit"
                                        disabled={generating || plans.length === 0}
                                        className="flex-1 py-3.5 bg-[#111111] hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                                    >
                                        {generating
                                            ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</>
                                            : `Generate ${quantity || 0}`
                                        }
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}

export default function VouchersPage() {
    return (
        <ClientGuard>
            <VouchersContent />
        </ClientGuard>
    )
}


interface Voucher {
    id: number
    code: string
    status: "unused" | "active" | "expired"
    consumedAt: string | null
    expiresAt: string | null
    createdAt: string
    planName: string | null
    planPrice: string | null
    planDuration: number | null
}

function formatDate(d: string | null) {
    if (!d) return "-"
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function VouchersContent() {
    const [activeTab, setActiveTab] = useState("all")
    const [vouchers, setVouchers] = useState<Voucher[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchVouchers = (tab: string) => {
        setIsLoading(true)
        const url = tab === "all" ? "/api/client/vouchers" : `/api/client/vouchers?status=${tab}`
        fetch(url)
            .then(r => r.json())
            .then(data => setVouchers(Array.isArray(data) ? data : []))
            .catch(console.error)
            .finally(() => setIsLoading(false))
    }

    useEffect(() => { fetchVouchers("all") }, [])

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        fetchVouchers(tab)
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-gray-900">Voucher Management</h1>
                        <p className="text-gray-500 text-sm mt-1">Generate and track internet vouchers for your customers.</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#111111] text-white font-bold rounded-2xl hover:bg-orange-500 transition-all shadow-lg shadow-black/10">
                        <Plus className="w-5 h-5" />
                        <span>Generate Vouchers</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-100">
                        {["all", "active", "unused", "expired"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={cn(
                                    "px-6 py-2 text-sm font-bold rounded-xl transition-all capitalize",
                                    activeTab === tab ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 focus-within:bg-white transition-all">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Search by code..." className="bg-transparent border-none outline-none text-xs font-medium w-48" />
                        </div>
                        <button className="p-2 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white transition-all">
                            <Filter className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 text-xs font-bold rounded-xl border border-gray-100 hover:bg-white transition-all">
                            <Download className="w-4 h-4" />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] text-gray-500 uppercase font-black">
                                <th className="px-8 py-5">Voucher Code</th>
                                <th className="px-6 py-5">Plan</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5">Used At</th>
                                <th className="px-6 py-5">Expires At</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr><td colSpan={6} className="px-8 py-12 text-center text-gray-400 text-sm">
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading vouchers...
                                </td></tr>
                            ) : vouchers.length === 0 ? (
                                <tr><td colSpan={6} className="px-8 py-12 text-center text-gray-400 text-sm">
                                    No vouchers found. Generate some to get started.
                                </td></tr>
                            ) : vouchers.map((voucher) => (
                                <tr key={voucher.id} className="group hover:bg-gray-50/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                                                <Ticket className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-gray-900 font-outfit">{voucher.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-sm font-semibold text-gray-600">{voucher.planName ?? "—"}</td>
                                    <td className="px-6 py-6">
                                        <span className={cn(
                                            "px-3 py-1 text-[10px] font-black uppercase rounded-full border",
                                            voucher.status === "active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                voucher.status === "unused" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                    "bg-gray-50 text-gray-400 border-gray-100"
                                        )}>
                                            {voucher.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-xs text-gray-500 font-medium">{formatDate(voucher.consumedAt)}</td>
                                    <td className="px-6 py-6 text-xs text-gray-500 font-medium">{formatDate(voucher.expiresAt)}</td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                                            <MoreVertical className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-8 bg-gray-50/30 flex items-center justify-between">
                        <p className="text-xs text-gray-500 font-medium">Showing {vouchers.length} voucher{vouchers.length !== 1 ? "s" : ""}</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default function VouchersPage() {
    return (
        <ClientGuard>
            <VouchersContent />
        </ClientGuard>
    )
}


    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-gray-900">Voucher Management</h1>
                        <p className="text-gray-500 text-sm mt-1">Generate and track internet vouchers for your customers.</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#111111] text-white font-bold rounded-2xl hover:bg-orange-500 transition-all shadow-lg shadow-black/10">
                        <Plus className="w-5 h-5" />
                        <span>Generate Vouchers</span>
                    </button>
                </div>

                {/* Filters & Actions */}
                <div className="flex items-center justify-between bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-100">
                        {["all", "active", "unused", "expired"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-6 py-2 text-sm font-bold rounded-xl transition-all capitalize",
                                    activeTab === tab ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 focus-within:bg-white transition-all">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Search by code..." className="bg-transparent border-none outline-none text-xs font-medium w-48" />
                        </div>
                        <button className="p-2 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white transition-all">
                            <Filter className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 text-xs font-bold rounded-xl border border-gray-100 hover:bg-white transition-all">
                            <Download className="w-4 h-4" />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>

                {/* Vouchers Table */}
                <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] text-gray-500 uppercase font-black">
                                <th className="px-8 py-5">Voucher Code</th>
                                <th className="px-6 py-5">Plan Detail</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5">Used At</th>
                                <th className="px-6 py-5">Expires At</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {vouchers.map((voucher) => (
                                <tr key={voucher.id} className="group hover:bg-gray-50/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                                                <Ticket className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-gray-900 font-outfit">{voucher.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-sm font-semibold text-gray-600">{voucher.plan}</td>
                                    <td className="px-6 py-6">
                                        <span className={cn(
                                            "px-3 py-1 text-[10px] font-black uppercase rounded-full border",
                                            voucher.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                voucher.status === "Unused" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                    "bg-gray-50 text-gray-400 border-gray-100"
                                        )}>
                                            {voucher.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-xs text-gray-500 font-medium">{voucher.usedAt}</td>
                                    <td className="px-6 py-6 text-xs text-gray-500 font-medium">{voucher.expiresAt}</td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                                            <MoreVertical className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-8 bg-gray-50/30 flex items-center justify-between">
                        <p className="text-xs text-gray-500 font-medium">Showing 4 of 1,248 vouchers</p>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-400 hover:text-black transition-all disabled:opacity-50">Previous</button>
                            <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-400 hover:text-black transition-all">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
