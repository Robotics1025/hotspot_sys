"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { ClientGuard } from "@/components/ClientGuard"
import {
    LayoutDashboard, Plus, Clock, Zap, X, Edit2, Trash2,
    Loader2, AlertCircle, Check, MoreVertical,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"

interface Plan {
    id: number
    name: string
    duration: number   // seconds
    speedLimit: string | null
    price: string
    createdAt: string | null
}

const UNIT_OPTIONS = [
    { label: "Minutes", value: "minutes", multiplier: 60 },
    { label: "Hours",   value: "hours",   multiplier: 3600 },
    { label: "Days",    value: "days",    multiplier: 86400 },
    { label: "Weeks",   value: "weeks",   multiplier: 604800 },
    { label: "Months",  value: "months",  multiplier: 2592000 },
]

function secondsToUnit(seconds: number): { value: number; unit: string } {
    if (seconds % 2592000 === 0) return { value: seconds / 2592000, unit: "months" }
    if (seconds % 604800 === 0)  return { value: seconds / 604800,  unit: "weeks"  }
    if (seconds % 86400 === 0)   return { value: seconds / 86400,   unit: "days"   }
    if (seconds % 3600 === 0)    return { value: seconds / 3600,    unit: "hours"  }
    return { value: Math.round(seconds / 60), unit: "minutes" }
}

function formatDuration(seconds: number): string {
    const { value, unit } = secondsToUnit(seconds)
    const label = UNIT_OPTIONS.find(u => u.value === unit)!.label
    return `${value} ${value === 1 ? label.slice(0, -1) : label}`
}

const CARD_COLORS = [
    { bg: "bg-orange-100",  icon: "text-orange-500"  },
    { bg: "bg-indigo-100",  icon: "text-indigo-500"  },
    { bg: "bg-emerald-100", icon: "text-emerald-500" },
    { bg: "bg-sky-100",     icon: "text-sky-500"     },
    { bg: "bg-rose-100",    icon: "text-rose-500"    },
    { bg: "bg-amber-100",   icon: "text-amber-500"   },
]

const EMPTY_FORM = { name: "", durationValue: "1", durationUnit: "hours", speedLimit: "", price: "" }

function PlansContent() {
    const [planList, setPlanList]       = useState<Plan[]>([])
    const [loading, setLoading]         = useState(true)

    const [showModal, setShowModal]     = useState(false)
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
    const [form, setForm]               = useState({ ...EMPTY_FORM })
    const [submitting, setSubmitting]   = useState(false)
    const [formError, setFormError]     = useState("")

    const [openMenuId, setOpenMenuId]   = useState<number | null>(null)
    const [deletingId, setDeletingId]   = useState<number | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => { fetchPlans() }, [])

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    async function fetchPlans() {
        setLoading(true)
        try {
            const res = await fetch("/api/client/plans")
            const data = await res.json()
            setPlanList(Array.isArray(data) ? data : [])
        } catch { setPlanList([]) }
        finally { setLoading(false) }
    }

    function openCreate() {
        setEditingPlan(null)
        setForm({ ...EMPTY_FORM })
        setFormError("")
        setShowModal(true)
    }

    function openEdit(plan: Plan) {
        const { value, unit } = secondsToUnit(plan.duration)
        setEditingPlan(plan)
        setForm({
            name: plan.name,
            durationValue: String(value),
            durationUnit: unit,
            speedLimit: plan.speedLimit ?? "",
            price: plan.price,
        })
        setFormError("")
        setShowModal(true)
        setOpenMenuId(null)
    }

    function getDurationSeconds(): number {
        const multiplier = UNIT_OPTIONS.find(u => u.value === form.durationUnit)!.multiplier
        return parseInt(form.durationValue || "0") * multiplier
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!form.name.trim()) { setFormError("Plan name is required"); return }
        if (!form.durationValue || parseInt(form.durationValue) <= 0) { setFormError("Duration must be greater than 0"); return }
        if (!form.price || parseFloat(form.price) <= 0) { setFormError("Price must be greater than 0"); return }

        setSubmitting(true)
        setFormError("")
        const payload = {
            id: editingPlan?.id,
            name: form.name.trim(),
            durationSeconds: getDurationSeconds(),
            speedLimit: form.speedLimit.trim() || null,
            price: form.price,
        }

        try {
            const res = await fetch("/api/client/plans", {
                method: editingPlan ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await res.json()
            if (!res.ok) { setFormError(data.error ?? "Something went wrong"); return }

            if (editingPlan) {
                setPlanList(prev => prev.map(p => p.id === data.id ? data : p))
            } else {
                setPlanList(prev => [data, ...prev])
            }
            setShowModal(false)
        } catch { setFormError("Network error. Please try again.") }
        finally { setSubmitting(false) }
    }

    async function handleDelete(planId: number) {
        if (!confirm("Delete this plan and all its vouchers?")) return
        setDeletingId(planId)
        setOpenMenuId(null)
        try {
            const res = await fetch(`/api/client/plans?id=${planId}`, { method: "DELETE" })
            if (res.ok) setPlanList(prev => prev.filter(p => p.id !== planId))
        } catch {}
        finally { setDeletingId(null) }
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-gray-900">Internet Plans</h1>
                        <p className="text-gray-500 text-sm mt-1">Configure your hotspot packages and pricing models.</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-6 py-3 bg-[#111111] text-white font-bold rounded-2xl hover:bg-orange-500 transition-all shadow-lg shadow-black/10"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Plan
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {planList.map((plan, idx) => {
                            const color = CARD_COLORS[idx % CARD_COLORS.length]
                            return (
                                <div key={plan.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col relative">
                                    <div className="absolute top-5 right-5" ref={openMenuId === plan.id ? menuRef : undefined}>
                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === plan.id ? null : plan.id)}
                                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                                        >
                                            {deletingId === plan.id
                                                ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                                : <MoreVertical className="w-4 h-4 text-gray-400" />
                                            }
                                        </button>
                                        {openMenuId === plan.id && (
                                            <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-1">
                                                <button
                                                    onClick={() => openEdit(plan)}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors rounded-t-2xl"
                                                >
                                                    <Edit2 className="w-4 h-4" /> Edit Plan
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(plan.id)}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors rounded-b-2xl"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className={`w-14 h-14 rounded-2xl mb-5 flex items-center justify-center ${color.bg}`}>
                                        <LayoutDashboard className={`w-7 h-7 ${color.icon}`} />
                                    </div>

                                    <h3 className="text-xl font-bold font-outfit text-gray-900 mb-2">{plan.name}</h3>
                                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full w-fit mb-6">
                                        <Check className="w-3 h-3" /> Active
                                    </div>

                                    <div className="space-y-3 mb-6 flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Duration</p>
                                                <p className="text-xs font-bold text-gray-700">{formatDuration(plan.duration)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                                                <Zap className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Speed Limit</p>
                                                <p className="text-xs font-bold text-gray-700">{plan.speedLimit ?? "Unlimited"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                                                <span className="text-[9px] font-black text-gray-400">UGX</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Price</p>
                                                <p className="text-xs font-bold text-gray-700">UGX {parseFloat(plan.price).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-50">
                                        <button
                                            onClick={() => openEdit(plan)}
                                            className="w-full py-3 bg-gray-50 text-gray-900 text-xs font-bold rounded-2xl hover:bg-orange-50 hover:text-orange-600 transition-all flex items-center justify-center gap-2 border border-gray-100"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" /> Edit Plan
                                        </button>
                                    </div>
                                </div>
                            )
                        })}

                        <button
                            onClick={openCreate}
                            className="group bg-gray-50 border-2 border-dashed border-gray-200 rounded-[32px] p-6 flex flex-col items-center justify-center gap-4 hover:bg-white hover:border-orange-300 transition-all min-h-[380px]"
                        >
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <Plus className="w-8 h-8 text-gray-300 group-hover:text-orange-500" />
                            </div>
                            <div className="text-center">
                                <h4 className="font-bold text-gray-400 group-hover:text-gray-900 transition-colors">Create Plan</h4>
                                <p className="text-xs text-gray-400 font-medium">Add a new package</p>
                            </div>
                        </button>
                    </div>
                )}
            </div>

            {/* ── Create / Edit slide-over ─────────────────────────────────── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-bold font-outfit text-gray-900">
                                    {editingPlan ? "Edit Plan" : "Create New Plan"}
                                </h2>
                                <p className="text-sm text-gray-400 mt-0.5">
                                    {editingPlan ? `Editing "${editingPlan.name}"` : "Set up a new internet package"}
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 px-8 py-6 gap-5 overflow-y-auto">
                            <div>
                                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">Plan Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. Daily Pass"
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">Duration *</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.durationValue}
                                        onChange={e => setForm(f => ({ ...f, durationValue: e.target.value }))}
                                        className="w-24 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-center"
                                    />
                                    <select
                                        value={form.durationUnit}
                                        onChange={e => setForm(f => ({ ...f, durationUnit: e.target.value }))}
                                        className="flex-1 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                                    >
                                        {UNIT_OPTIONS.map(u => (
                                            <option key={u.value} value={u.value}>{u.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">Price (UGX) *</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">UGX</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="100"
                                        value={form.price}
                                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                                        placeholder="1000"
                                        className="w-full pl-14 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">
                                    Speed Limit <span className="font-normal normal-case text-gray-400">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.speedLimit}
                                    onChange={e => setForm(f => ({ ...f, speedLimit: e.target.value }))}
                                    placeholder="e.g. 2M/2M — leave blank for unlimited"
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                                />
                                <p className="text-xs text-gray-400 mt-1.5">Format: download/upload e.g. 5M/5M</p>
                            </div>

                            {formError && (
                                <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-50 rounded-2xl px-4 py-3">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {formError}
                                </div>
                            )}

                            <div className="mt-auto pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3.5 border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3.5 bg-[#111111] hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                                >
                                    {submitting
                                        ? <><Loader2 className="w-4 h-4 animate-spin" />{editingPlan ? "Saving..." : "Creating..."}</>
                                        : editingPlan ? "Save Changes" : "Create Plan"
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}

export default function PlansPage() {
    return (
        <ClientGuard>
            <PlansContent />
        </ClientGuard>
    )
}


const CARD_COLORS = [
    "bg-orange-100",
    "bg-indigo-100",
    "bg-emerald-100",
    "bg-sky-100",
    "bg-rose-100",
    "bg-amber-100",
]

function PlansContent() {
    const [planList, setPlanList] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/client/plans")
            .then(r => r.json())
            .then(data => { setPlanList(Array.isArray(data) ? data : []); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-gray-900">Internet Plans</h1>
                        <p className="text-gray-500 text-sm mt-1">Configure your hotspot packages and pricing models.</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#111111] text-white font-bold rounded-2xl hover:bg-orange-500 transition-all shadow-lg shadow-black/10">
                        <Plus className="w-5 h-5" />
                        <span>Create New Plan</span>
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    </div>
                ) : planList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center">
                            <LayoutDashboard className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-semibold">No plans created yet.</p>
                        <p className="text-gray-400 text-sm">Click &quot;Create New Plan&quot; to add your first package.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-6">
                        {planList.map((plan, idx) => (
                            <div key={plan.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col group relative">
                                <button className="absolute top-6 right-6 p-2 hover:bg-gray-50 rounded-xl transition-all">
                                    <MoreVertical className="w-4 h-4 text-gray-400" />
                                </button>

                                <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center ${CARD_COLORS[idx % CARD_COLORS.length]}`}>
                                    <LayoutDashboard className="w-7 h-7 text-gray-900" />
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-xl font-bold font-outfit text-gray-900 mb-2">{plan.name}</h3>
                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full w-fit">
                                        Active
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Duration</p>
                                            <p className="text-xs font-bold text-gray-700">{formatDuration(plan.duration)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                            <Zap className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Speed Limit</p>
                                            <p className="text-xs font-bold text-gray-700">{plan.speedLimit ?? "Unlimited"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                            <DollarSign className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Price</p>
                                            <p className="text-xs font-bold text-gray-700">KES {parseFloat(plan.price).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 border-t border-gray-50 flex gap-2">
                                    <button className="flex-1 py-3 bg-gray-50 text-gray-900 text-xs font-bold rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 border border-gray-100">
                                        <Edit2 className="w-3.5 h-3.5" />
                                        Edit
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Create New Placeholder */}
                        <button className="group bg-gray-50 border-2 border-dashed border-gray-200 rounded-[32px] p-6 flex flex-col items-center justify-center gap-4 hover:bg-white hover:border-orange-300 transition-all min-h-[400px]">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <Plus className="w-8 h-8 text-gray-300 group-hover:text-orange-500" />
                            </div>
                            <div className="text-center">
                                <h4 className="font-bold text-gray-400 group-hover:text-gray-900 transition-colors">Create Plan</h4>
                                <p className="text-xs text-gray-400 font-medium">Add a new package</p>
                            </div>
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default function PlansPage() {
    return (
        <ClientGuard>
            <PlansContent />
        </ClientGuard>
    )
}

    { id: 1, name: "Quick Access", duration: "5 Minutes", speed: "1M/1M", price: "Free", active: true, color: "bg-gray-100" },
    { id: 2, name: "Fast Browse", duration: "1 Hour", speed: "2M/2M", price: "$66", active: true, color: "bg-orange-100" },
    { id: 3, name: "Heavy Stream", duration: "3 Hour", speed: "5M/5M", price: "$56", active: true, color: "bg-indigo-100" },
    { id: 4, name: "Daily Pass", duration: "1 Day", speed: "10M/10M", price: "$51", active: false, color: "bg-emerald-100" },
]

export default function PlansPage() {
    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-gray-900">Internet Plans</h1>
                        <p className="text-gray-500 text-sm mt-1">Configure your hotspot packages and pricing models.</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#111111] text-white font-bold rounded-2xl hover:bg-orange-500 transition-all shadow-lg shadow-black/10">
                        <Plus className="w-5 h-5" />
                        <span>Create New Plan</span>
                    </button>
                </div>

                <div className="grid grid-cols-4 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col group relative">
                            <button className="absolute top-6 right-6 p-2 hover:bg-gray-50 rounded-xl transition-all">
                                <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>

                            <div className={cn("w-14 h-14 rounded-2xl mb-6 flex items-center justify-center", plan.color)}>
                                <LayoutDashboard className="w-7 h-7 text-gray-900" />
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold font-outfit text-gray-900 mb-2">{plan.name}</h3>
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full w-fit">
                                    {plan.active ? "Enabled" : "Disabled"}
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Duration</p>
                                        <p className="text-xs font-bold text-gray-700">{plan.duration}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                        <Zap className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Speed Limit</p>
                                        <p className="text-xs font-bold text-gray-700">{plan.speed}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Price</p>
                                        <p className="text-xs font-bold text-gray-700">{plan.price}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-gray-50 flex gap-2">
                                <button className="flex-1 py-3 bg-gray-50 text-gray-900 text-xs font-bold rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 border border-gray-100">
                                    <Edit2 className="w-3.5 h-3.5" />
                                    Edit
                                </button>
                                <button className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all border border-rose-100">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Create New Placeholder */}
                    <button className="group bg-gray-50 border-2 border-dashed border-gray-200 rounded-[32px] p-6 flex flex-col items-center justify-center gap-4 hover:bg-white hover:border-orange-300 transition-all min-h-[400px]">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Plus className="w-8 h-8 text-gray-300 group-hover:text-orange-500" />
                        </div>
                        <div className="text-center">
                            <h4 className="font-bold text-gray-400 group-hover:text-gray-900 transition-colors">Create Plan</h4>
                            <p className="text-xs text-gray-400 font-medium">Add a new package</p>
                        </div>
                    </button>
                </div>
            </div>
        </DashboardLayout>
    )
}
