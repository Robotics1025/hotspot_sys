"use client"

import Link from "next/link"
import DashboardLayout from "@/components/DashboardLayout"
// import { AdminGuard } from "@/components/AdminGuard"
import {
    Users,
    Building2,
    Ticket,
    DollarSign,
    ArrowUpRight,
    Globe,
    Activity,
    Terminal,
    Shield,
    Zap,
    Server,
    Clock,
    Router,
    AlertCircle,
    CheckCircle2,
    Plus,
    X,
    Phone,
    Copy,
    Check,
    Info
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface MonthlyRevenue {
    month: string;
    revenue: number;
    commission: number;
}

interface PlatformStats {
    totalClients: number;
    totalNodes: number;
    totalRevenue: number;
    totalCommission: number;
    monthlyRevenue: MonthlyRevenue[];
}

interface ActivityEvent {
    id: string;
    type: "signup" | "payment";
    title: string;
    detail: string;
    time: string | null;
}

function timeAgo(dateStr: string | null): string {
    if (!dateStr) return "unknown";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
    return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? "s" : ""} ago`;
}

const systemHealth = [
    { name: "RADIUS Server", status: "Operational", uptime: "99.99%", load: "12%", icon: Shield },
    { name: "Cloud VPS", status: "Optimal", uptime: "100%", load: "24%", icon: Server },
    { name: "Payment Gateway", status: "Active", uptime: "99.95%", load: "4%", icon: Zap },
]

export default function AdminDashboard() {
    const [isAddClientOpen, setIsAddClientOpen] = useState(false)
    const [step, setStep] = useState<'form' | 'success'>('form')
    const [formData, setFormData] = useState({ name: '', phone: '' })
    const [generatedCreds, setGeneratedCreds] = useState({ username: '', password: '' })
    const [copied, setCopied] = useState(false)
    const [statsData, setStatsData] = useState<PlatformStats | null>(null)
    const [isLoadingStats, setIsLoadingStats] = useState(true)
    const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([])
    const [isLoadingActivity, setIsLoadingActivity] = useState(true)

    useEffect(() => {
        fetchStats()
        fetchActivity()
    }, [])

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats')
            if (!res.ok) throw new Error(`Stats API error: ${res.status}`)
            const data = await res.json()
            setStatsData(data)
        } catch (error) {
            console.error("Failed to fetch stats:", error)
        } finally {
            setIsLoadingStats(false)
        }
    }

    const fetchActivity = async () => {
        try {
            const res = await fetch('/api/admin/activity')
            if (!res.ok) throw new Error(`Activity API error: ${res.status}`)
            const data = await res.json()
            setActivityEvents(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error("Failed to fetch activity:", error)
        } finally {
            setIsLoadingActivity(false)
        }
    }

    const handleAddClient = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const res = await fetch('/api/admin/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    payoutPhoneNumber: formData.phone
                })
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData.detail || errData.error || "Failed to create client")
            }
            const data = await res.json()

            setGeneratedCreds({
                username: data.credentials.email,
                password: data.credentials.password
            })
            setStep('success')
            fetchStats()
            fetchActivity()
        } catch (error) {
            console.error("Error creating client:", error)
            alert("Failed to create client")
        }
    }


    const resetModal = () => {
        setIsAddClientOpen(false)
        setStep('form')
        setFormData({ name: '', phone: '' })
        setCopied(false)
    }

    const copyToClipboard = () => {
        const text = `FastNet Admin Credentials\nBusiness: ${formData.name}\nLogin Email: ${generatedCreds.username}\nPassword: ${generatedCreds.password}\nLogin URL: ${window.location.origin}/admin/login`
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-gray-900">Platform Command Center</h1>
                        <p className="text-gray-500 text-sm mt-1">Cross-platform infrastructure monitoring and revenue intelligence.</p>
                    </div>
                    <button
                        onClick={() => setIsAddClientOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add New Client</span>
                    </button>
                </div>

                {/* Top Row: Global Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { name: "Total Clients", value: isLoadingStats ? "..." : statsData?.totalClients.toString() || "0", change: "+2", icon: Building2, color: "bg-blue-500" },
                        { name: "Total Revenue", value: isLoadingStats ? "..." : `$${statsData?.totalRevenue.toLocaleString() || "0"}`, change: "+12.5%", icon: DollarSign, color: "bg-emerald-500" },
                        { name: "Active Nodes", value: isLoadingStats ? "..." : statsData?.totalNodes.toString() || "0", change: "+4", icon: Router, color: "bg-indigo-500" },
                        { name: "Platform Commission", value: isLoadingStats ? "..." : `$${statsData?.totalCommission.toLocaleString() || "0"}`, change: "+$842", icon: Activity, color: "bg-orange-500" },
                    ].map((stat) => (
                        <div key={stat.name} className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm group">

                            <div className="flex justify-between items-start mb-4">
                                <div className={cn("p-3 rounded-2xl text-white", stat.color)}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                                    <ArrowUpRight className="w-3 h-3" />
                                    {stat.change}
                                </div>
                            </div>
                            <p className="text-xs font-semibold text-gray-400 mb-1">{stat.name}</p>
                            <h3 className="text-2xl font-bold text-gray-900 font-outfit">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content: Trends & Live Feed */}
                    <div className="flex-1 flex flex-col gap-8">

                        {/* Revenue Trend Graph */}
                        <div className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm overflow-hidden">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className="text-xl font-bold font-outfit">Revenue Performance</h2>
                                    <p className="text-gray-500 text-sm">Monthly platform growth analysis</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                                        <span className="text-xs font-bold text-gray-500">Gross</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                                        <span className="text-xs font-bold text-gray-500">Commission</span>
                                    </div>
                                </div>
                            </div>

                            {(!statsData?.monthlyRevenue || statsData.monthlyRevenue.length === 0) ? (
                                <div className="h-48 flex items-center justify-center text-gray-300 text-sm font-bold">No revenue data yet</div>
                            ) : (
                                <div className="h-48 flex items-end gap-2 px-2">
                                    {(() => {
                                        const data = statsData.monthlyRevenue
                                        const maxVal = Math.max(...data.map(d => d.revenue), 1)
                                        return data.map((d, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar">
                                                <div
                                                    className="w-full bg-blue-500/10 group-hover/bar:bg-blue-500 rounded-lg transition-all duration-300 relative"
                                                    style={{ height: `${Math.max((d.revenue / maxVal) * 100, 4)}%` }}
                                                >
                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-black px-2 py-1 rounded-md opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                                                        ${d.revenue.toLocaleString()}
                                                    </div>
                                                </div>
                                                <span className="text-[8px] font-black uppercase text-gray-300 tracking-tighter sm:text-[10px]">
                                                    {d.month}
                                                </span>
                                            </div>
                                        ))
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* Global Activity Feed */}
                        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden min-w-0">
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                <h2 className="text-xl font-bold font-outfit">Global Activity Feed</h2>
                                <button className="text-xs font-black uppercase tracking-widest text-blue-500 hover:text-blue-600">View All Logs</button>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {isLoadingActivity ? (
                                    <div className="p-8 text-center text-gray-400 text-sm">Loading activity...</div>
                                ) : activityEvents.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400 text-sm">No activity yet. Add a client or record a transaction.</div>
                                ) : (
                                    activityEvents.map((event) => {
                                        const Icon = event.type === "signup" ? Building2 : DollarSign;
                                        const iconColor = event.type === "signup" ? "text-blue-500" : "text-emerald-500";
                                        return (
                                            <div key={event.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                                                <div className="flex items-center gap-5">
                                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50 group-hover:scale-110 transition-transform", iconColor)}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 font-outfit">{event.title}</p>
                                                        <p className="text-xs text-gray-500">{event.detail}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        <Clock className="w-3 h-3" />
                                                        {timeAgo(event.time)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Infrastructure & Quick Actions */}
                    <div className="w-full lg:w-96 shrink-0 flex flex-col gap-8">

                        {/* Infrastructure Health */}
                        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 font-outfit">System Health</h3>
                                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">All Systems Operational</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {systemHealth.map((item) => (
                                    <div key={item.name} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-gray-400">
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{item.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.uptime} Uptime</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-black text-gray-900">{item.load}</div>
                                            <div className="text-[8px] font-bold text-gray-400 uppercase">Load</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Platform Control Panel */}
                        <div className="bg-[#111111] p-8 rounded-[40px] text-white flex flex-col gap-6 shadow-xl shadow-black/10">
                            <div>
                                <h3 className="text-sm font-bold opacity-50 uppercase tracking-widest mb-1">Control Panel</h3>
                                <p className="text-[10px] text-gray-500">Infrastructure management tools.</p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => setIsAddClientOpen(true)}
                                    className="flex items-center justify-between p-5 bg-white/5 hover:bg-orange-500 rounded-3xl transition-all group w-full text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-orange-500 group-hover:text-white">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-sm">Deploy New Client</span>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>

                                <Link href="/admin/scripts" className="flex items-center justify-between p-5 bg-white/5 hover:bg-orange-500 rounded-3xl transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-orange-500 group-hover:text-white">
                                            <Terminal className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-sm">Global Scripts</span>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </div>

                            <div className="pt-6 border-t border-white/5">
                                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-start gap-4">
                                    <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
                                    <p className="text-[10px] text-orange-200 leading-relaxed font-medium">
                                        There are 2 routers currently reporting high signal interference. Review Router Fleet logs.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Client Overlay */}
            {isAddClientOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={resetModal}
                    />

                    <div className="relative w-full max-w-xl bg-white rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-white/20">
                        {/* Modal Header */}
                        <div className="p-10 pb-0 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center shadow-inner">
                                    <Building2 className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold font-outfit text-gray-900">
                                        {step === 'form' ? 'Deploy New Client' : 'Client Deployed!'}
                                    </h2>
                                    <p className="text-gray-500 text-sm font-medium">
                                        {step === 'form' ? 'Quickly onboard a new business partner.' : 'Initial credentials have been generated.'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={resetModal}
                                className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-gray-100 transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-10">
                            {step === 'form' ? (
                                <form onSubmit={handleAddClient} className="space-y-8">
                                    <div className="space-y-6">
                                        <div className="group space-y-2">
                                            <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-2">Business Name</label>
                                            <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-3xl px-6 py-5 focus-within:bg-white focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/5 transition-all outline-none">
                                                <Building2 className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500" />
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="e.g. Skyline Apartments"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="bg-transparent outline-none flex-1 text-sm font-bold text-gray-900"
                                                />
                                            </div>
                                        </div>

                                        <div className="group space-y-2">
                                            <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-2">Payout Phone Number</label>
                                            <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-3xl px-6 py-5 focus-within:bg-white focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/5 transition-all outline-none">
                                                <Phone className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500" />
                                                <input
                                                    required
                                                    type="tel"
                                                    placeholder="254..."
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="bg-transparent outline-none flex-1 text-sm font-bold text-gray-900"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={resetModal}
                                            className="flex-1 px-8 py-5 bg-gray-50 text-gray-600 font-bold rounded-[22px] hover:bg-gray-100 transition-all border border-gray-100"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-2 flex items-center justify-center gap-2 px-8 py-5 bg-[#111111] text-white font-bold rounded-[22px] hover:bg-orange-500 transition-all shadow-xl shadow-black/10 group"
                                        >
                                            <Zap className="w-5 h-5 text-orange-500 group-hover:text-white transition-colors" />
                                            <span>Generate Credentials</span>
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-4xl p-8 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Login Email</p>
                                                <p className="text-lg font-bold text-gray-900 font-outfit break-all">{generatedCreds.username}</p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Temporary Password</p>
                                                <p className="text-xl font-bold text-gray-900 font-mono tracking-tighter">{generatedCreds.password}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={copyToClipboard}
                                            className={cn(
                                                "w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-sm transition-all",
                                                copied ? "bg-emerald-500 text-white" : "bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                                            )}
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            {copied ? "Copied to Clipboard!" : "Copy Business Credentials"}
                                        </button>
                                    </div>

                                    <div className="p-6 bg-amber-50 rounded-[28px] border border-amber-100 flex gap-4">
                                        <Info className="w-6 h-6 text-amber-500 shrink-0" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-amber-900">Next Technical Steps</p>
                                            <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                                                Please provide these credentials to the client. They will be prompted to set a permanent password upon their first login. This account is automatically enrolled in the 15% commission model.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={resetModal}
                                        className="w-full py-5 bg-[#111111] text-white font-bold rounded-[22px] hover:bg-black transition-all shadow-xl shadow-black/10"
                                    >
                                        Done & Back to Dashboard
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
