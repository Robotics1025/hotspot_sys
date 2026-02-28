"use client"


import DashboardLayout from "@/components/DashboardLayout"
import { Users, User, Ticket, AlertCircle, Play, MoreHorizontal, ArrowUpRight, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ClientGuard } from "@/components/ClientGuard"
import { useEffect, useState } from "react"

function ClientDashboardContent() {
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/client/stats')
                if (!res.ok) throw new Error('Failed to fetch')
                const json = await res.json()
                setData(json)
            } catch (err) {
                console.error("Error fetching client dashboard stats:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
            </DashboardLayout>
        )
    }

    const { vouchers, financial, recentActivity, popularPlans } = data || {}

    // We can map the specific stats the user wants to see:
    const stats = [
        { name: "Total Revenue", value: `UGX ${(financial?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "bg-emerald-500" },
        { name: "Commission Owed (-10%)", value: `UGX ${(financial?.totalCommission || 0).toLocaleString()}`, icon: AlertCircle, color: "bg-rose-500" },
        { name: "Vouchers Generated", value: vouchers?.total || 0, icon: Ticket, color: "bg-blue-500" },
    ]

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold font-outfit text-white tracking-tight">Client Dashboard</h1>
                        <p className="text-gray-400 mt-1">Manage your hotspot, vouchers, and users.</p>
                    </div>
                    <Link
                        href="/client/vouchers"
                        className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
                    >
                        Generate Vouchers
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.name} className="bg-[#111111] border border-[#222222] p-6 rounded-2xl relative overflow-hidden group">
                            <div className="flex items-start justify-between relative z-10">
                                <div>
                                    <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                                    <h3 className="text-3xl font-bold font-outfit text-white mt-2">{stat.value}</h3>
                                </div>
                                <div className={cn("p-3 rounded-xl", stat.color, "bg-opacity-10")}>
                                    <stat.icon className={cn("w-6 h-6", stat.color.replace('bg-', 'text-'))} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-[#111111] border border-[#222222] rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold font-outfit text-white">Recent Vouchers Generated</h2>
                            <Link href="/client/transactions" className="p-2 hover:bg-[#222222] rounded-lg transition-colors group">
                                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-white" />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {recentActivity?.map((activity: any) => (
                                <div key={activity.id} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl hover:bg-[#222222] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-[#2a2a2a] rounded-full flex items-center justify-center">
                                            <Ticket className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{activity.code}</p>
                                            <p className="text-sm text-gray-400">{activity.plan}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-white">{activity.price}</p>
                                        <span className={cn(
                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 uppercase",
                                            activity.status === 'unused' ? "bg-emerald-500/10 text-emerald-500" :
                                                activity.status === 'active' ? "bg-blue-500/10 text-blue-500" :
                                                    "bg-gray-500/10 text-gray-500"
                                        )}>
                                            {activity.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {(!recentActivity || recentActivity.length === 0) && (
                                <div className="text-center py-6 text-gray-400">
                                    No vouchers generated yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Popular Plans */}
                    <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold font-outfit text-white">Popular Plans</h2>
                        </div>
                        <div className="space-y-4 flex-1">
                            {popularPlans?.map((plan: any) => (
                                <div key={plan.name} className="p-4 bg-[#1a1a1a] rounded-xl border border-[#222222] relative overflow-hidden group hover:border-[#333333] transition-colors">
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-white">{plan.name}</span>
                                            <span className="text-sm font-semibold text-white">{plan.price}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <span className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                {plan.duration}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!popularPlans || popularPlans.length === 0) && (
                                <div className="text-center py-6 text-gray-400">
                                    No popular plans yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function ClientDashboard() {
    return (
        <ClientGuard>
            <ClientDashboardContent />
        </ClientGuard>
    );
}
