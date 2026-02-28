"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { ClientGuard } from "@/components/ClientGuard"
import {
    Ticket,
    DollarSign,
    Router,
    LayoutGrid,
    TrendingUp,
    CheckCircle2,
    Clock,
    Ban,
    ArrowUpRight,
    RefreshCw,
    Wifi
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ClientStats {
    vouchers: {
        total: number
        active: number
        unused: number
        expired: number
    }
    financial: {
        totalRevenue: number
        totalPayout: number
        transactionCount: number
    }
    resources: {
        planCount: number
        routerCount: number
    }
    recentTransactions: {
        id: number
        amount: string
        status: string
        createdAt: string
    }[]
}

function fmtUGX(val: number) {
    return `UGX ${val.toLocaleString()}`
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

function ClientDashboardContent() {
    const [stats, setStats] = useState<ClientStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => { fetchStats() }, [])

    const fetchStats = async () => {
        setIsLoading(true)
        try {
            const res  = await fetch("/api/client/stats")
            const data = await res.json()
            if (res.ok) setStats(data)
        } catch (e) { console.error(e) }
        finally { setIsLoading(false) }
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
            </DashboardLayout>
        )
    }

    const v = stats?.vouchers
    const f = stats?.financial
    const r = stats?.resources

    return (
        <DashboardLayout>
        <div className="flex flex-col gap-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-outfit text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Your hotspot network at a glance.</p>
                </div>
                <button onClick={fetchStats} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all text-sm font-medium">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Top stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    {
                        label: "Total Vouchers",
                        value: v?.total.toLocaleString() ?? "0",
                        sub: `${v?.unused ?? 0} unused`,
                        icon: Ticket,
                        color: "bg-orange-100 text-orange-600",
                        href: "/client/vouchers",
                    },
                    {
                        label: "Total Revenue",
                        value: fmtUGX(f?.totalRevenue ?? 0),
                        sub: `${f?.transactionCount ?? 0} transactions`,
                        icon: TrendingUp,
                        color: "bg-emerald-100 text-emerald-600",
                        href: "/client/transactions",
                    },
                    {
                        label: "Your Earnings",
                        value: fmtUGX(f?.totalPayout ?? 0),
                        sub: "After platform fee",
                        icon: DollarSign,
                        color: "bg-blue-100 text-blue-600",
                        href: "/client/transactions",
                    },
                    {
                        label: "Routers",
                        value: r?.routerCount.toString() ?? "0",
                        sub: `${r?.planCount ?? 0} plans`,
                        icon: Router,
                        color: "bg-indigo-100 text-indigo-600",
                        href: "/client/routers",
                    },
                ].map((stat) => (
                    <Link key={stat.label} href={stat.href} className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("p-3 rounded-2xl", stat.color)}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transition-colors" />
                        </div>
                        <p className="text-xs font-semibold text-gray-400 mb-1">{stat.label}</p>
                        <p className="text-xl font-bold text-gray-900 font-outfit leading-tight">{stat.value}</p>
                        <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Voucher breakdown */}
                <div className="bg-white rounded-4xl border border-gray-100 shadow-sm p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold font-outfit text-gray-900">Voucher Status</h2>
                            <p className="text-xs text-gray-400 mt-0.5">{v?.total ?? 0} total issued</p>
                        </div>
                        <Link href="/client/vouchers" className="text-xs font-bold text-orange-500 hover:underline">View all</Link>
                    </div>
                    <div className="flex flex-col gap-4">
                        {[
                            { label: "Unused",  value: v?.unused  ?? 0, color: "bg-blue-500",    text: "text-blue-700",    sub: "bg-blue-50",   icon: Clock },
                            { label: "Active",  value: v?.active  ?? 0, color: "bg-emerald-500", text: "text-emerald-700", sub: "bg-emerald-50", icon: CheckCircle2 },
                            { label: "Expired", value: v?.expired ?? 0, color: "bg-red-400",     text: "text-red-700",    sub: "bg-red-50",    icon: Ban },
                        ].map(item => {
                            const pct = v?.total ? Math.round((item.value / v.total) * 100) : 0
                            const Icon = item.icon
                            return (
                                <div key={item.label} className={cn("flex items-center gap-4 p-4 rounded-2xl", item.sub)}>
                                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0", item.color)}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={cn("text-sm font-bold", item.text)}>{item.label}</span>
                                            <span className={cn("text-sm font-bold", item.text)}>{item.value.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-white/60 rounded-full h-1.5">
                                            <div className={cn("h-1.5 rounded-full", item.color)} style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Recent transactions */}
                <div className="lg:col-span-2 bg-white rounded-4xl border border-gray-100 shadow-sm p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold font-outfit text-gray-900">Recent Transactions</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Last 10 payments</p>
                        </div>
                        <Link href="/client/transactions" className="text-xs font-bold text-orange-500 hover:underline">View all</Link>
                    </div>

                    {!stats?.recentTransactions?.length ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
                            <DollarSign className="w-10 h-10" />
                            <p className="text-sm font-medium">No transactions yet</p>
                            <p className="text-xs text-center">Transactions appear here when customers use vouchers.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col divide-y divide-gray-50">
                            {stats.recentTransactions.map((tx) => (
                                <div key={tx.id} className="flex items-center gap-4 py-4">
                                    <div className={cn(
                                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                                        tx.status === "completed" ? "bg-emerald-100 text-emerald-600" :
                                        tx.status === "pending"   ? "bg-yellow-100 text-yellow-600" :
                                                                    "bg-red-100 text-red-600"
                                    )}>
                                        <DollarSign className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 text-sm">Transaction #{tx.id}</p>
                                        <p className="text-xs text-gray-400">{timeAgo(tx.createdAt)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900 text-sm">{fmtUGX(Number(tx.amount))}</p>
                                        <span className={cn(
                                            "text-xs font-bold px-2 py-0.5 rounded-full",
                                            tx.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                                            tx.status === "pending"   ? "bg-yellow-100 text-yellow-700" :
                                                                        "bg-red-100 text-red-700"
                                        )}>{tx.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Manage Plans",   icon: LayoutGrid, href: "/client/plans",        color: "text-orange-500" },
                    { label: "View Vouchers",  icon: Ticket,     href: "/client/vouchers",     color: "text-blue-500" },
                    { label: "Routers & NAS",  icon: Wifi,       href: "/client/routers",      color: "text-indigo-500" },
                    { label: "Transactions",   icon: DollarSign, href: "/client/transactions", color: "text-emerald-500" },
                ].map(item => (
                    <Link key={item.label} href={item.href} className="bg-white border border-gray-100 rounded-3xl p-6 flex items-center gap-4 hover:shadow-md transition-all group">
                        <div className={cn("p-3 rounded-2xl bg-gray-50 group-hover:bg-orange-50 transition-colors", item.color)}>
                            <item.icon className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-gray-700 text-sm group-hover:text-gray-900 transition-colors">{item.label}</span>
                        <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 ml-auto transition-colors" />
                    </Link>
                ))}
            </div>

        </div>
        </DashboardLayout>
    )
}

export default function ClientDashboard() {
    return (
        <ClientGuard>
            <ClientDashboardContent />
        </ClientGuard>
    )
}
