"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { ClientGuard } from "@/components/ClientGuard"
import {
    Router as RouterIcon, Activity, Wifi, Plus, Settings, ShieldCheck,
    Loader2, X, AlertCircle, Copy, Check, Trash2, Edit2, ExternalLink, Eye, EyeOff,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"

interface Router {
    id: number
    name: string
    ip: string | null
    secret: string
    version: string
    createdAt: string | null
}

const EMPTY_FORM = { name: "", ip: "", secret: "", version: "v7" }

function CopyButton({ text, label }: { text: string; label?: string }) {
    const [copied, setCopied] = useState(false)
    return (
        <button
            onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-gray-100 hover:bg-orange-100 hover:text-orange-600 rounded-lg transition-colors"
        >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            {label ?? (copied ? "Copied!" : "Copy")}
        </button>
    )
}

function formatDate(d: string | null) {
    if (!d) return "—"
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function RoutersContent() {
    const [routerList, setRouterList]   = useState<Router[]>([])
    const [loading, setLoading]         = useState(true)

    const [showModal, setShowModal]     = useState(false)
    const [editingRouter, setEditingRouter] = useState<Router | null>(null)
    const [form, setForm]               = useState({ ...EMPTY_FORM })
    const [submitting, setSubmitting]   = useState(false)
    const [formError, setFormError]     = useState("")
    const [showSecret, setShowSecret]   = useState(false)

    const [openMenuId, setOpenMenuId]   = useState<number | null>(null)
    const [deletingId, setDeletingId]   = useState<number | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => { fetchRouters() }, [])

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    async function fetchRouters() {
        setLoading(true)
        try {
            const res = await fetch("/api/client/routers")
            const data = await res.json()
            setRouterList(Array.isArray(data) ? data : [])
        } catch { setRouterList([]) }
        finally { setLoading(false) }
    }

    function openCreate() {
        setEditingRouter(null)
        setForm({ ...EMPTY_FORM })
        setFormError(""); setShowSecret(false)
        setShowModal(true)
    }

    function openEdit(r: Router) {
        setEditingRouter(r)
        setForm({ name: r.name, ip: r.ip ?? "", secret: r.secret, version: r.version })
        setFormError(""); setShowSecret(false)
        setShowModal(true)
        setOpenMenuId(null)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!form.name.trim()) { setFormError("Router name is required"); return }
        if (!form.secret.trim()) { setFormError("RADIUS secret is required"); return }

        setSubmitting(true); setFormError("")
        try {
            const res = await fetch("/api/client/routers", {
                method: editingRouter ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingRouter?.id,
                    name: form.name.trim(),
                    ip: form.ip.trim() || null,
                    secret: form.secret.trim(),
                    version: form.version,
                }),
            })
            const data = await res.json()
            if (!res.ok) { setFormError(data.error ?? "Something went wrong"); return }

            if (editingRouter) {
                setRouterList(prev => prev.map(r => r.id === data.id ? data : r))
            } else {
                setRouterList(prev => [data, ...prev])
            }
            setShowModal(false)
        } catch { setFormError("Network error. Please try again.") }
        finally { setSubmitting(false) }
    }

    async function handleDelete(routerId: number) {
        if (!confirm("Remove this router? It will stop authenticating users.")) return
        setDeletingId(routerId); setOpenMenuId(null)
        try {
            const res = await fetch(`/api/client/routers?id=${routerId}`, { method: "DELETE" })
            if (res.ok) setRouterList(prev => prev.filter(r => r.id !== routerId))
        } catch {}
        finally { setDeletingId(null) }
    }

    function portalUrl(routerId: number) {
        return `${typeof window !== "undefined" ? window.location.origin : ""}/portal?router_id=${routerId}`
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-gray-900">Router Fleet</h1>
                        <p className="text-gray-500 text-sm mt-1">Monitor and configure your MikroTik Network Access Servers.</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-6 py-3 bg-[#111111] text-white font-bold rounded-2xl hover:bg-orange-500 transition-all shadow-lg shadow-black/10"
                    >
                        <Plus className="w-5 h-5" />
                        Connect New NAS
                    </button>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Table */}
                    <div className="col-span-12">
                        <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                            {loading ? (
                                <div className="flex items-center justify-center py-24">
                                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                </div>
                            ) : routerList.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center">
                                        <RouterIcon className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 font-semibold">No routers connected yet</p>
                                    <p className="text-gray-400 text-sm">Click &quot;Connect New NAS&quot; to add your first MikroTik router.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] text-gray-500 uppercase font-black">
                                            <th className="px-8 py-5">Router Name</th>
                                            <th className="px-6 py-5">IP Address</th>
                                            <th className="px-6 py-5">RouterOS</th>
                                            <th className="px-6 py-5">Portal URL</th>
                                            <th className="px-6 py-5">Added</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {routerList.map(device => (
                                            <tr key={device.id} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-orange-100 text-orange-500">
                                                            <RouterIcon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-gray-900 font-outfit block">{device.name}</span>
                                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">NAS #{device.id}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-sm font-mono font-semibold text-gray-600">{device.ip ?? "—"}</td>
                                                <td className="px-6 py-6">
                                                    <span className="px-2.5 py-1 text-[10px] font-black uppercase rounded-full border bg-indigo-50 text-indigo-600 border-indigo-100">
                                                        {device.version}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <a
                                                            href={portalUrl(device.id)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs font-mono text-gray-400 hover:text-orange-500 transition-colors flex items-center gap-1"
                                                        >
                                                            /portal?router_id={device.id} <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                        <CopyButton text={portalUrl(device.id)} />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-xs text-gray-500">{formatDate(device.createdAt)}</td>
                                                <td className="px-8 py-6 text-right relative">
                                                    <div className="relative inline-block" ref={openMenuId === device.id ? menuRef : undefined}>
                                                        <button
                                                            onClick={() => setOpenMenuId(openMenuId === device.id ? null : device.id)}
                                                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                                                        >
                                                            {deletingId === device.id
                                                                ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                                                : <Settings className="w-4 h-4 text-gray-400" />
                                                            }
                                                        </button>
                                                        {openMenuId === device.id && (
                                                            <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-1">
                                                                <button
                                                                    onClick={() => openEdit(device)}
                                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-t-2xl"
                                                                >
                                                                    <Edit2 className="w-4 h-4" /> Edit Router
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(device.id)}
                                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-b-2xl"
                                                                >
                                                                    <Trash2 className="w-4 h-4" /> Remove
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Info cards */}
                    <div className="col-span-4 bg-orange-500 p-8 rounded-[32px] text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4">
                            <Wifi className="w-48 h-48" />
                        </div>
                        <div className="relative z-10">
                            <ShieldCheck className="w-12 h-12 mb-6" />
                            <h3 className="text-2xl font-bold font-outfit mb-2">RADIUS Ready</h3>
                            <p className="text-white/80 text-sm leading-relaxed">
                                All routers delegate AAA requests to the central VPS RADIUS server.
                            </p>
                        </div>
                    </div>

                    <div className="col-span-4 bg-[#111111] p-8 rounded-[32px] text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <Activity className="w-12 h-12 text-orange-500 mb-6" />
                            <h3 className="text-2xl font-bold font-outfit mb-2">Performance</h3>
                            <p className="text-white/60 text-sm leading-relaxed mb-6">Network load balanced across all active routers.</p>
                            <div className="flex items-end gap-3">
                                <div className="text-4xl font-bold font-outfit">{routerList.length}</div>
                                <div className="text-orange-500 text-sm font-bold mb-1">Router{routerList.length !== 1 ? "s" : ""}</div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-4 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold font-outfit text-gray-900 mb-6">Summary</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Total Routers</span>
                                <span className="text-sm font-black text-gray-900">{routerList.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">RouterOS v7</span>
                                <span className="text-sm font-black text-gray-900">{routerList.filter(r => r.version === "v7").length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">RouterOS v6</span>
                                <span className="text-sm font-black text-gray-900">{routerList.filter(r => r.version === "v6").length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Add / Edit NAS slide-over ─────────────────────────────────── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-bold font-outfit text-gray-900">
                                    {editingRouter ? "Edit Router" : "Connect New NAS"}
                                </h2>
                                <p className="text-sm text-gray-400 mt-0.5">
                                    {editingRouter ? `Editing "${editingRouter.name}"` : "Add a MikroTik router to your fleet"}
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 px-8 py-6 gap-5 overflow-y-auto">
                            {/* Name */}
                            <div>
                                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">Router Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. Main Lobby NAS"
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                                    autoFocus
                                />
                            </div>

                            {/* IP */}
                            <div>
                                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">
                                    IP Address <span className="font-normal normal-case text-gray-400">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.ip}
                                    onChange={e => setForm(f => ({ ...f, ip: e.target.value }))}
                                    placeholder="e.g. 192.168.1.1"
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-mono focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                                />
                            </div>

                            {/* RADIUS Secret */}
                            <div>
                                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">RADIUS Secret *</label>
                                <div className="relative">
                                    <input
                                        type={showSecret ? "text" : "password"}
                                        value={form.secret}
                                        onChange={e => setForm(f => ({ ...f, secret: e.target.value }))}
                                        placeholder="Shared secret for RADIUS"
                                        className="w-full px-4 pr-11 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-mono focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowSecret(s => !s)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-lg"
                                    >
                                        {showSecret ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-1.5">Must match the secret set on the MikroTik RADIUS client</p>
                            </div>

                            {/* RouterOS Version */}
                            <div>
                                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">RouterOS Version *</label>
                                <div className="flex gap-3">
                                    {["v7", "v6"].map(v => (
                                        <button
                                            key={v}
                                            type="button"
                                            onClick={() => setForm(f => ({ ...f, version: v }))}
                                            className={`flex-1 py-3 rounded-2xl text-sm font-bold border transition-all ${
                                                form.version === v
                                                    ? "bg-[#111111] text-white border-[#111111]"
                                                    : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400"
                                            }`}
                                        >
                                            RouterOS {v}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {formError && (
                                <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-50 rounded-2xl px-4 py-3">
                                    <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
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
                                        ? <><Loader2 className="w-4 h-4 animate-spin" />{editingRouter ? "Saving..." : "Connecting..."}</>
                                        : editingRouter ? "Save Changes" : "Connect Router"
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

export default function RoutersPage() {
    return (
        <ClientGuard>
            <RoutersContent />
        </ClientGuard>
    )
}


interface Router {
    id: number
    name: string
    ip: string | null
    version: string
    createdAt: string | null
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function RoutersContent() {
    const [routerList, setRouterList] = useState<Router[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/client/routers")
            .then(r => r.json())
            .then(data => { setRouterList(Array.isArray(data) ? data : []); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-gray-900">Router Fleet</h1>
                        <p className="text-gray-500 text-sm mt-1">Monitor and configure your MikroTik Network Access Servers.</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#111111] text-white font-bold rounded-2xl hover:bg-orange-500 transition-all shadow-lg shadow-black/10">
                        <Plus className="w-5 h-5" />
                        <span>Connect New NAS</span>
                    </button>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12">
                        <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                            {loading ? (
                                <div className="flex items-center justify-center py-24">
                                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                </div>
                            ) : routerList.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 gap-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center">
                                        <RouterIcon className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 font-semibold">No routers connected yet.</p>
                                    <p className="text-gray-400 text-sm">Click &quot;Connect New NAS&quot; to add your first MikroTik router.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] text-gray-500 uppercase font-black">
                                            <th className="px-8 py-5">Router Name</th>
                                            <th className="px-6 py-5">IP Address</th>
                                            <th className="px-6 py-5">Firmware</th>
                                            <th className="px-6 py-5">Added</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {routerList.map((device) => (
                                            <tr key={device.id} className="group hover:bg-gray-50/30 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-orange-100 text-orange-600">
                                                            <RouterIcon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-gray-900 font-outfit block">{device.name}</span>
                                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">MikroTik NAS</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-sm font-semibold text-gray-600 font-mono">{device.ip ?? "—"}</td>
                                                <td className="px-6 py-6 text-xs text-gray-500 font-bold">RouterOS {device.version}</td>
                                                <td className="px-6 py-6 text-xs text-gray-500">{formatDate(device.createdAt)}</td>
                                                <td className="px-8 py-6 text-right">
                                                    <button className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                                                        <Settings className="w-4 h-4 text-gray-400" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Info Cards */}
                    <div className="col-span-4 bg-orange-500 p-8 rounded-[32px] text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4">
                            <Wifi className="w-48 h-48" />
                        </div>
                        <div className="relative z-10">
                            <ShieldCheck className="w-12 h-12 mb-6" />
                            <h3 className="text-2xl font-bold font-outfit mb-2">RADIUS Ready</h3>
                            <p className="text-white/80 text-sm leading-relaxed mb-8">
                                All your routers are successfully delegating AAA requests to the central VPS.
                            </p>
                            <button className="px-6 py-3 bg-white text-orange-500 font-bold rounded-2xl hover:bg-orange-50 transition-all text-sm">
                                View RADIUS Log
                            </button>
                        </div>
                    </div>

                    <div className="col-span-4 bg-[#111111] p-8 rounded-[32px] text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <Activity className="w-12 h-12 text-orange-500 mb-6" />
                            <h3 className="text-2xl font-bold font-outfit mb-2">Performance</h3>
                            <p className="text-white/60 text-sm leading-relaxed mb-8">
                                Your network load is balanced across your active routers.
                            </p>
                            <div className="flex items-end gap-4">
                                <div className="text-4xl font-bold font-outfit">{routerList.length}</div>
                                <div className="text-orange-500 text-sm font-bold mb-1">Router{routerList.length !== 1 ? "s" : ""} Connected</div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-4 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold font-outfit text-gray-900 mb-6">Router Summary</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 font-medium">Total Routers</span>
                                <span className="text-sm font-black text-gray-900">{routerList.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 font-medium">RouterOS v7</span>
                                <span className="text-sm font-black text-gray-900">{routerList.filter(r => r.version === "v7").length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 font-medium">RouterOS v6</span>
                                <span className="text-sm font-black text-gray-900">{routerList.filter(r => r.version === "v6").length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default function RoutersPage() {
    return (
        <ClientGuard>
            <RoutersContent />
        </ClientGuard>
    )
}

