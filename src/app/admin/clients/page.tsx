"use client"

import DashboardLayout from "@/components/DashboardLayout"
// import { AdminGuard } from "@/components/AdminGuard"
import { Building2, Plus, Phone, Calendar, MoreVertical, X, Copy, Check, Loader2, Eye, EyeOff, AlertCircle, CheckCircle2, Trash2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

interface Client {
    id: number
    name: string
    payoutPhoneNumber: string | null
    balance: string
    createdAt: string
}

interface Credentials {
    email: string
    password: string
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)
    return (
        <button
            onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
        >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
        </button>
    )
}

export default function AdminClients() {
    const [clients, setClients] = useState<Client[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Add client modal
    const [showModal, setShowModal]       = useState(false)
    const [formName, setFormName]         = useState("")
    const [formPhone, setFormPhone]       = useState("")
    const [formRouterName, setFormRouterName] = useState("")
    const [formRouterIP, setFormRouterIP] = useState("")
    const [formRouterSecret, setFormRouterSecret] = useState("")
    const [formRouterVersion, setFormRouterVersion] = useState("v7")
    const [submitting, setSubmitting]     = useState(false)
    const [formError, setFormError]       = useState("")

    // Credentials and router reveal modal
    const [credentials, setCredentials]   = useState<Credentials | null>(null)
    const [routerInfo, setRouterInfo]     = useState<any | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    // Delete
    const [deletingId, setDeletingId]     = useState<number | null>(null)
    const [openMenuId, setOpenMenuId]     = useState<number | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    // Notification
    const [notification, setNotification] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        fetchClients()
    }, [])

    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null)
        }
        document.addEventListener("mousedown", onClickOutside)
        return () => document.removeEventListener("mousedown", onClickOutside)
    }, [])

    async function fetchClients() {
        setIsLoading(true)
        try {
            const res = await fetch("/api/admin/clients")
            const data = await res.json()
            setClients(Array.isArray(data) ? data : [])
        } catch { setClients([]) }
        finally { setIsLoading(false) }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        if (!formName.trim()) { setFormError("Business name is required"); return }
        if (!formRouterName.trim() || !formRouterSecret.trim()) { setFormError("Router name and secret are required"); return }
        setSubmitting(true)
        setFormError("")
        try {
            // 1. Create client
            const res = await fetch("/api/admin/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: formName.trim(), payoutPhoneNumber: formPhone.trim() || null }),
            })
            const data = await res.json()
            if (!res.ok) { setFormError(data.error ?? "Failed to create client"); return }
            const client = data.client
            // 2. Add router for this client
            const routerRes = await fetch("/api/admin/routers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clientId: client.id,
                    name: formRouterName.trim(),
                    ip: formRouterIP.trim() || null,
                    secret: formRouterSecret.trim(),
                    version: formRouterVersion,
                }),
            })
            const routerData = await routerRes.json()
            if (!routerRes.ok) { setFormError(routerData.error ?? "Failed to add router"); return }
            setClients(prev => [client, ...prev])
            // Redirect to client detail page with credentials in query
            router.push(`/admin/clients/${client.id}?password=${encodeURIComponent(data.credentials.password)}`)
            setShowModal(false)
            setFormName(""); setFormPhone(""); setFormRouterName(""); setFormRouterIP(""); setFormRouterSecret(""); setFormRouterVersion("v7")
        } catch { setFormError("Network error. Please try again.") }
        finally { setSubmitting(false) }
    }

    async function handleDelete(clientId: number) {
        setConfirmDeleteId(clientId)
    }

    async function confirmDelete(clientId: number) {
        setDeletingId(clientId)
        setConfirmDeleteId(null)
        try {
            const res = await fetch(`/api/admin/clients?id=${clientId}`, { method: "DELETE" })
            if (res.ok) {
                setClients(prev => prev.filter(c => c.id !== clientId))
                setNotification("Client has been successfully deleted.")
                setTimeout(() => setNotification(null), 3000)
            }
        } catch {}
        finally { setDeletingId(null); setOpenMenuId(null) }
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-gray-900">Platform Clients</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage and monitor all business partners on the platform.</p>
                    </div>
                    <button
                        onClick={() => { setShowModal(true); setFormError("") }}
                        className="flex items-center gap-2 px-6 py-3 bg-[#111111] text-white font-bold rounded-2xl hover:bg-orange-500 transition-all shadow-lg shadow-black/10"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Client
                    </button>
                </div>

                <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-[400px]">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Clients...</p>
                            </div>
                        </div>
                    ) : clients.length === 0 ? (
                        <div className="flex items-center justify-center p-20 text-center">
                            <div>
                                <Building2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-400">No Clients Yet</h3>
                                <p className="text-gray-400 text-sm mt-1">Click &quot;Add New Client&quot; to onboard your first business partner.</p>
                            </div>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] text-gray-500 uppercase font-black">
                                    <th className="px-8 py-5">Business Name</th>
                                    <th className="px-6 py-5">Payout Contact</th>
                                    <th className="px-6 py-5">Wallet Balance</th>
                                    <th className="px-6 py-5">Join Date</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {clients.map((client) => (
                                    <tr key={client.id} className="group hover:bg-gray-50/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
                                                    <Building2 className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-gray-900 font-outfit block">{client.name}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ID: #{client.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                {client.payoutPhoneNumber || <span className="text-gray-300">Not set</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 font-bold text-emerald-600">
                                            UGX {parseFloat(client.balance || "0").toLocaleString()}
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(client.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right relative">
                                            <div className="relative inline-block" ref={openMenuId === client.id ? menuRef : undefined}>
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === client.id ? null : client.id)}
                                                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                                                >
                                                    {deletingId === client.id
                                                        ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                                        : <MoreVertical className="w-5 h-5 text-gray-400" />
                                                    }
                                                </button>
                                                {openMenuId === client.id && (
                                                    <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-1">
                                                        <button
                                                            onClick={() => handleDelete(client.id)}
                                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors rounded-2xl"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete Client
                                                        </button>
                                                    </div>
                                                )}
                                                {/* Custom Delete Confirmation Modal */}
                                                {confirmDeleteId === client.id && (
                                                    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
                                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in" onClick={() => setConfirmDeleteId(null)} />
                                                        <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 border border-white/20">
                                                            <div className="p-8 pb-0 flex items-center justify-between">
                                                                <h2 className="text-2xl font-bold font-outfit text-gray-900">Delete Client</h2>
                                                                <button onClick={() => setConfirmDeleteId(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
                                                                    <X className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                            <div className="p-8 pt-4">
                                                                <p className="text-gray-700 mb-6">Are you sure you want to delete this client? <b>This cannot be undone.</b></p>
                                                                <div className="flex gap-4 justify-end">
                                                                    <button
                                                                        onClick={() => setConfirmDeleteId(null)}
                                                                        className="px-6 py-2 rounded-2xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-all"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        onClick={() => confirmDelete(client.id)}
                                                                        className="px-6 py-2 rounded-2xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
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

            {/* ── Add Client slide-over ───────────────────────────────────────── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    {/* Panel */}
                    <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-bold font-outfit text-gray-900">Add New Client</h2>
                                <p className="text-sm text-gray-400 mt-0.5">Onboard a new business partner</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="flex flex-col flex-1 px-8 py-6 gap-5 overflow-y-auto">
                            <div>
                                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">Business Name *</label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={e => setFormName(e.target.value)}
                                    placeholder="e.g. Kampala City Cafe"
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">Payout Phone Number</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 font-bold select-none">+256</span>
                                    <input
                                        type="tel"
                                        value={formPhone}
                                        onChange={e => setFormPhone(e.target.value.replace(/[^0-9]/g, ""))}
                                        placeholder="7XXXXXXXX"
                                        className="w-full pl-16 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                                        maxLength={9}
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1.5">Enter a valid Uganda phone number (without leading zero)</p>
                            </div>
                            <div className="bg-gray-100 border border-gray-200 rounded-2xl p-4 mt-2">
                                <p className="text-xs font-bold text-gray-700 mb-1">Router Details (required)</p>
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="text"
                                        value={formRouterName}
                                        onChange={e => setFormRouterName(e.target.value)}
                                        placeholder="Router Name"
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                                    />
                                    <input
                                        type="text"
                                        value={formRouterIP}
                                        onChange={e => setFormRouterIP(e.target.value)}
                                        placeholder="Router IP (optional)"
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                                    />
                                    <input
                                        type="text"
                                        value={formRouterSecret}
                                        onChange={e => setFormRouterSecret(e.target.value)}
                                        placeholder="RADIUS Secret"
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                                    />
                                    <select
                                        value={formRouterVersion}
                                        onChange={e => setFormRouterVersion(e.target.value)}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                                    >
                                        <option value="v7">MikroTik v7</option>
                                        <option value="v6">MikroTik v6</option>
                                    </select>
                                </div>
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
                                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : "Create Client"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Credentials and Router reveal modal ───────────────────────── */}
            {credentials && routerInfo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setCredentials(null); setRouterInfo(null) }} />
                    <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
                        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                        </div>
                        <h2 className="text-xl font-bold font-outfit text-gray-900 text-center mb-1">Client & Router Created!</h2>
                        <p className="text-sm text-gray-400 text-center mb-6">Save these credentials and router details — the password and secret won&apos;t be shown again.</p>
                        <div className="space-y-3 mb-6">
                            <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Login Email</p>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-bold text-gray-900 break-all">{credentials.email}</span>
                                    <CopyButton text={credentials.email} />
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Password</p>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-bold text-gray-900 font-mono tracking-widest">
                                        {showPassword ? credentials.password : "••••••••••••"}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setShowPassword(p => !p)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                            {showPassword ? <EyeOff className="w-3.5 h-3.5 text-gray-400" /> : <Eye className="w-3.5 h-3.5 text-gray-400" />}
                                        </button>
                                        <CopyButton text={credentials.password} />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Router Name</p>
                                <span className="text-sm font-bold text-gray-900">{routerInfo.name}</span>
                            </div>
                            <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Router IP</p>
                                <span className="text-sm font-bold text-gray-900">{routerInfo.ip || 'N/A'}</span>
                            </div>
                            <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">RADIUS Secret</p>
                                <span className="text-sm font-bold text-gray-900">{routerInfo.secret}</span>
                            </div>
                            <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Firmware Version</p>
                                <span className="text-sm font-bold text-gray-900">{routerInfo.version}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => { setCredentials(null); setRouterInfo(null); setShowPassword(false) }}
                            className="w-full py-3.5 bg-[#111111] hover:bg-orange-500 text-white font-bold rounded-2xl transition-all"
                        >
                            Done — I&apos;ve saved these
                        </button>
                    </div>
                </div>
            )}

            {notification && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg font-bold animate-in fade-in">
                    {notification}
                </div>
            )}

        </DashboardLayout>
    )
}
