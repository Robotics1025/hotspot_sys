"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { AdminGuard } from "@/components/AdminGuard"
import {
    Ticket,
    Search,
    Plus,
    Download,
    Eye,
    Trash2,
    AlertCircle,
    CheckCircle2,
    Clock,
    Ban,
    RefreshCw,
    X,
    Building2,
    Loader2
} from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface Voucher {
    id: number
    code: string
    status: "unused" | "active" | "expired" | "disabled"
    consumedAt: string | null
    expiresAt: string | null
    createdAt: string
    clientName: string
    planName: string
    planPrice: string
    planDuration: number
}

interface Client {
    id: number
    name: string
}

interface Plan {
    id: number
    name: string
    price: string
    duration: number
}

interface VouchersResponse {
    vouchers: Voucher[]
    statusCounts: Record<string, number>
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

const statusConfig = {
    unused:   { label: "Unused",   color: "bg-blue-100 text-blue-700",      icon: Clock },
    active:   { label: "Active",   color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
    expired:  { label: "Expired",  color: "bg-red-100 text-red-700",         icon: AlertCircle },
    disabled: { label: "Disabled", color: "bg-gray-100 text-gray-700",       icon: Ban },
}

function formatDuration(seconds: number) {
    const mins  = Math.floor(seconds / 60)
    const hours = Math.floor(mins / 60)
    const days  = Math.floor(hours / 24)
    if (days  > 0) return `${days} day${days > 1 ? "s" : ""}`
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`
    return `${mins} min`
}

function formatDate(d: string | null) {
    if (!d) return "-"
    return new Date(d).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
    })
}

function fmtUGX(val: string | number) {
    return `UGX ${Number(val).toLocaleString()}`
}

export default function AdminVouchersPage() {
    const [vouchers, setVouchers]           = useState<Voucher[]>([])
    const [clients, setClients]             = useState<Client[]>([])
    const [plans, setPlans]                 = useState<Plan[]>([])
    const [statusCounts, setStatusCounts]   = useState<Record<string, number>>({ unused: 0, active: 0, expired: 0, disabled: 0 })
    const [isLoading, setIsLoading]         = useState(true)
    const [isLoadingPlans, setIsLoadingPlans] = useState(false)
    const [pagination, setPagination]       = useState({ total: 0, page: 1, limit: 50, totalPages: 0 })
    const [filters, setFilters]             = useState({ clientId: "", status: "", search: "" })

    // Generate modal
    const [showGenerate, setShowGenerate]   = useState(false)
    const [genForm, setGenForm]             = useState({ clientId: "", planId: "", quantity: 10 })
    const [isGenerating, setIsGenerating]   = useState(false)
    const [genSuccess, setGenSuccess]       = useState("")
    const [genError, setGenError]           = useState("")

    useEffect(() => { fetchVouchers(); fetchClients() }, [filters.clientId, filters.status, pagination.page])

    const fetchVouchers = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(filters.clientId && { clientId: filters.clientId }),
                ...(filters.status   && { status: filters.status }),
            })
            const res  = await fetch(`/api/admin/vouchers?${params}`)
            const data: VouchersResponse = await res.json()
            if (res.ok) {
                setVouchers(data.vouchers)
                setStatusCounts(data.statusCounts || { unused: 0, active: 0, expired: 0, disabled: 0 })
                setPagination(data.pagination)
            }
        } catch (e) { console.error(e) }
        finally { setIsLoading(false) }
    }

    const fetchClients = async () => {
        try {
            const res  = await fetch("/api/admin/clients")
            const data = await res.json()
            if (res.ok) setClients(Array.isArray(data) ? data : [])
        } catch (e) { console.error(e) }
    }

    const fetchPlansForClient = async (clientId: string) => {
        if (!clientId) { setPlans([]); return }
        setIsLoadingPlans(true)
        try {
            const res  = await fetch(`/api/admin/plans?clientId=${clientId}`)
            const data = await res.json()
            setPlans(res.ok && Array.isArray(data) ? data : [])
        } catch (e) { console.error(e); setPlans([]) }
        finally { setIsLoadingPlans(false) }
    }

    const handleGenerate = async () => {
        if (!genForm.clientId || !genForm.planId) { setGenError("Select a client and plan."); return }
        if (genForm.quantity < 1 || genForm.quantity > 500) { setGenError("Quantity must be 1–500."); return }
        setIsGenerating(true); setGenError(""); setGenSuccess("")
        try {
            const res  = await fetch("/api/admin/vouchers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientId: parseInt(genForm.clientId), planId: parseInt(genForm.planId), quantity: genForm.quantity }),
            })
            const data = await res.json()
            if (res.ok) {
                setGenSuccess(`Generated ${genForm.quantity} vouchers successfully!`)
                setTimeout(() => { setShowGenerate(false); resetGenForm(); fetchVouchers() }, 1500)
            } else {
                setGenError(data.error || "Failed to generate vouchers.")
            }
        } catch { setGenError("Network error.") }
        finally { setIsGenerating(false) }
    }

    const resetGenForm = () => {
        setGenForm({ clientId: "", planId: "", quantity: 10 })
        setPlans([]); setGenSuccess(""); setGenError("")
    }

    const handleDisable = async (id: number) => {
        if (!confirm("Disable this voucher?")) return
        await fetch(`/api/admin/vouchers?id=${id}`, { method: "DELETE" })
        fetchVouchers()
    }

    const exportCSV = () => {
        const header = "Code,Client,Plan,Price,Duration,Status,Created,Consumed"
        const rows = vouchers.map(v =>
            `${v.code},${v.clientName},${v.planName},${v.planPrice},${formatDuration(v.planDuration)},${v.status},${v.createdAt},${v.consumedAt || ""}`
        )
        const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" })
        const url  = URL.createObjectURL(blob)
        const a    = document.createElement("a"); a.href = url; a.download = "vouchers.csv"; a.click()
        URL.revokeObjectURL(url)
    }

    const displayed = filters.search
        ? vouchers.filter(v => v.code.toLowerCase().includes(filters.search.toLowerCase()))
        : vouchers

    return (
        <AdminGuard>
        <DashboardLayout>
        <div className="flex flex-col gap-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-outfit text-gray-900">Voucher Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Monitor and manage all vouchers across the platform.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchVouchers} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all">
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                    <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button onClick={() => { resetGenForm(); setShowGenerate(true) }} className="flex items-center gap-2 px-6 py-3 bg-[#111111] text-white font-bold rounded-2xl hover:bg-orange-500 transition-all shadow-lg shadow-black/10">
                        <Plus className="w-5 h-5" /> Generate Vouchers
                    </button>
                </div>
            </div>

            {/* Stats — real DB totals */}
            <div className="grid grid-cols-4 gap-6">
                {(Object.entries(statusConfig) as [string, typeof statusConfig["unused"]][]).map(([status, cfg]) => {
                    const Icon = cfg.icon
                    return (
                        <div key={status} className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{(statusCounts[status] ?? 0).toLocaleString()}</p>
                                    <p className="text-sm text-gray-500 mt-1">{cfg.label} Vouchers</p>
                                </div>
                                <div className={cn("w-12 h-12 rounded-4xl flex items-center justify-center", cfg.color)}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-4xl border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by voucher code..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                    </div>
                    <select
                        value={filters.clientId}
                        onChange={(e) => { setFilters({ ...filters, clientId: e.target.value }); setPagination(p => ({ ...p, page: 1 })) }}
                        className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    >
                        <option value="">All Clients</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPagination(p => ({ ...p, page: 1 })) }}
                        className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="unused">Unused</option>
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="disabled">Disabled</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-4xl border border-gray-100 overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                    </div>
                ) : displayed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] gap-3 text-gray-400">
                        <Ticket className="w-12 h-12" />
                        <p className="font-medium">No vouchers found</p>
                    </div>
                ) : (
                    <>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
                                    <th className="text-left p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
                                    <th className="text-left p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Plan</th>
                                    <th className="text-left p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="text-left p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Consumed</th>
                                    <th className="text-right p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {displayed.map((v) => {
                                    const StatusIcon = statusConfig[v.status].icon
                                    return (
                                        <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                                                        <Ticket className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-mono font-bold text-gray-900">{v.code}</p>
                                                        <p className="text-xs text-gray-400">ID: {v.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                                                    <span className="font-medium text-gray-900">{v.clientName ?? "—"}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <p className="font-medium text-gray-900">{v.planName ?? "—"}</p>
                                                <p className="text-xs text-gray-500">{fmtUGX(v.planPrice)} · {formatDuration(v.planDuration)}</p>
                                            </td>
                                            <td className="p-6">
                                                <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold", statusConfig[v.status].color)}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusConfig[v.status].label}
                                                </div>
                                            </td>
                                            <td className="p-6 text-sm text-gray-700">{formatDate(v.createdAt)}</td>
                                            <td className="p-6 text-sm text-gray-700">{formatDate(v.consumedAt)}</td>
                                            <td className="p-6">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all" title="View">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDisable(v.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Disable">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {pagination.totalPages > 1 && (
                        <div className="border-t border-gray-100 p-6 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total.toLocaleString()} vouchers
                            </p>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} disabled={pagination.page === 1}
                                    className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-all">
                                    Previous
                                </button>
                                {[...Array(Math.min(pagination.totalPages, 7))].map((_, i) => {
                                    const pg = i + 1
                                    return (
                                        <button key={pg} onClick={() => setPagination(p => ({ ...p, page: pg }))}
                                            className={cn("px-3 py-1 text-sm rounded-lg transition-all",
                                                pg === pagination.page ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                                            {pg}
                                        </button>
                                    )
                                })}
                                <button onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} disabled={pagination.page === pagination.totalPages}
                                    className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-all">
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                    </>
                )}
            </div>
        </div>

        {/* Generate Vouchers Slide-over */}
        {showGenerate && (
            <div className="fixed inset-0 z-50 flex">
                <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={() => { setShowGenerate(false); resetGenForm() }} />
                <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
                    <div className="flex items-center justify-between p-8 border-b border-gray-100">
                        <div>
                            <h2 className="text-xl font-bold font-outfit text-gray-900">Generate Vouchers</h2>
                            <p className="text-sm text-gray-500 mt-1">Create a batch for a client</p>
                        </div>
                        <button onClick={() => { setShowGenerate(false); resetGenForm() }} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-8 flex flex-col gap-6 flex-1">
                        {genSuccess ? (
                            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <Ticket className="w-8 h-8 text-emerald-600" />
                                </div>
                                <p className="text-lg font-bold text-gray-900">{genSuccess}</p>
                                <p className="text-sm text-gray-400">Closing…</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700">Client</label>
                                    <select
                                        value={genForm.clientId}
                                        onChange={(e) => {
                                            const v = e.target.value
                                            setGenForm(f => ({ ...f, clientId: v, planId: "" }))
                                            fetchPlansForClient(v)
                                        }}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                    >
                                        <option value="">Select a client…</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700">Plan</label>
                                    {isLoadingPlans ? (
                                        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 text-sm">
                                            <Loader2 className="w-4 h-4 animate-spin" /> Loading plans…
                                        </div>
                                    ) : (
                                        <select
                                            value={genForm.planId}
                                            onChange={(e) => setGenForm(f => ({ ...f, planId: e.target.value }))}
                                            disabled={!genForm.clientId || plans.length === 0}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 disabled:opacity-50"
                                        >
                                            <option value="">{genForm.clientId ? (plans.length === 0 ? "No plans found" : "Select a plan…") : "Select client first"}</option>
                                            {plans.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} — {fmtUGX(p.price)} · {formatDuration(p.duration)}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700">Quantity</label>
                                    <input
                                        type="number" min={1} max={500}
                                        value={genForm.quantity}
                                        onChange={(e) => setGenForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                    />
                                    <div className="flex gap-2 mt-1">
                                        {[10, 25, 50, 100].map(q => (
                                            <button key={q} onClick={() => setGenForm(f => ({ ...f, quantity: q }))}
                                                className={cn("flex-1 py-2 text-xs font-bold rounded-lg border transition-all",
                                                    genForm.quantity === q
                                                        ? "bg-orange-500 text-white border-orange-500"
                                                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-orange-300")}>
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {genError && (
                                    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                                        <AlertCircle className="w-4 h-4 shrink-0" /> {genError}
                                    </div>
                                )}

                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !genForm.clientId || !genForm.planId}
                                    className="w-full py-4 bg-[#111111] text-white font-bold rounded-2xl hover:bg-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-auto"
                                >
                                    {isGenerating
                                        ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating…</>
                                        : <><Ticket className="w-5 h-5" /> Generate {genForm.quantity} Vouchers</>}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )}

        </DashboardLayout>
        </AdminGuard>
    )
}
