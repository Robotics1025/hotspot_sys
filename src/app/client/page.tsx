"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { Users, Ticket, AlertCircle, Play, MoreHorizontal, ArrowUpRight, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface ClientStats {
    totalVouchers: number;
    activeVouchers: number;
    totalRevenue: number;
}

interface Plan {
    id: number;
    name: string;
    duration: number;
    speedLimit: string | null;
    price: string;
}

interface Transaction {
    id: number;
    amount: string;
    payout: string;
    voucherCode: string | null;
    planName: string | null;
    createdAt: string;
}

function formatDuration(seconds: number) {
    const hours = Math.floor(seconds / 3600)
    const days = Math.floor(hours / 24)
    if (days > 0) return `${days} Day${days > 1 ? 's' : ''}`
    if (hours > 0) return `${hours} Hour${hours > 1 ? 's' : ''}`
    return `${Math.floor(seconds / 60)} Minutes`
}

const planColors = ["bg-orange-100", "bg-indigo-100", "bg-emerald-100", "bg-blue-100", "bg-rose-100"]

export default function ClientDashboard() {
    const [plans, setPlans] = useState<Plan[]>([])
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
    const [stats, setStats] = useState<ClientStats>({ totalVouchers: 0, activeVouchers: 0, totalRevenue: 0 })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setIsLoading(true)
            const [plansRes, vouchersRes, transactionsRes] = await Promise.all([
                fetch('/api/admin/plans'),
                fetch('/api/admin/vouchers?limit=100'),
                fetch('/api/admin/transactions?limit=5'),
            ])

            if (plansRes.ok) {
                const plansData = await plansRes.json()
                setPlans(plansData.slice(0, 3))
            }
            if (vouchersRes.ok) {
                const vouchersData = await vouchersRes.json()
                const vouchers = vouchersData.vouchers || []
                setStats({
                    totalVouchers: vouchersData.pagination?.total || 0,
                    activeVouchers: vouchers.filter((v: any) => v.status === 'active').length,
                    totalRevenue: 0,
                })
            }
            if (transactionsRes.ok) {
                const txData = await transactionsRes.json()
                setRecentTransactions(txData.transactions || [])
                setStats(prev => ({
                    ...prev,
                    totalRevenue: txData.summary?.totalPayout || 0
                }))
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const statCards = [
        { name: "Active Vouchers", value: isLoading ? "..." : stats.activeVouchers.toString(), change: "+15.6%", icon: Ticket, color: "bg-blue-500" },
        { name: "Total Vouchers", value: isLoading ? "..." : stats.totalVouchers.toString(), change: "+5.6%", icon: Users, color: "bg-emerald-500" },
        { name: "Network Alerts", value: "0", change: "—", icon: AlertCircle, color: "bg-rose-500" },
    ]

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-10">
                {/* Welcome Header */}
                <div className="relative h-64 bg-[#111111] rounded-4xl overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10" />
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-[url('https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700" />

                    <div className="relative z-20 h-full flex flex-col justify-center px-12">
                        <h1 className="text-4xl font-bold text-white mb-4 font-outfit">Welcome back!</h1>
                        <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
                            Manage your hotspot network and track your business performance in real-time.
                        </p>
                        <button className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-2xl hover:bg-orange-500 hover:text-white transition-all w-fit">
                            <Play className="w-4 h-4 fill-current" />
                            <span>Learn more</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Main Content Area */}
                    <div className="col-span-8 flex flex-col gap-10">
                        {/* Analytics Section */}
                        <div>
                            <div className="flex items-end justify-between mb-6">
                                <h2 className="text-xl font-bold font-outfit">Analytics</h2>
                                <button className="text-sm font-semibold text-gray-500 hover:text-orange-500">See more</button>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                {statCards.map((stat) => (
                                    <div key={stat.name} className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-orange-200 transition-all hover:shadow-lg hover:shadow-orange-500/5 group">
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
                        </div>

                        {/* Active Plans Section */}
                        <div>
                            <div className="flex items-end justify-between mb-6">
                                <h2 className="text-xl font-bold font-outfit">Active Plans</h2>
                                <button className="text-sm font-semibold text-gray-500 hover:text-orange-500">See more</button>
                            </div>
                            {isLoading ? (
                                <div className="flex items-center justify-center h-48">
                                    <RefreshCw className="w-6 h-6 text-gray-300 animate-spin" />
                                </div>
                            ) : plans.length === 0 ? (
                                <div className="text-center py-12 text-gray-400 text-sm">No plans created yet.</div>
                            ) : (
                                <div className="grid grid-cols-3 gap-6">
                                    {plans.map((plan, index) => (
                                        <div key={plan.id} className="bg-white p-4 rounded-4xl border border-gray-100 hover:border-orange-200 transition-all group overflow-hidden">
                                            <div className={cn("relative h-48 rounded-3xl mb-4 overflow-hidden", planColors[index % planColors.length])}>
                                                <div className="absolute inset-0 flex items-center justify-center opacity-20 transform -rotate-12">
                                                    <Ticket className="w-32 h-32" />
                                                </div>
                                                <div className="absolute top-4 right-4 p-2 bg-white/50 backdrop-blur rounded-xl">
                                                    <Ticket className="w-4 h-4 text-gray-900" />
                                                </div>
                                            </div>
                                            <div className="px-2">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-gray-900">{plan.name}</h3>
                                                    <span className="text-lg font-bold text-orange-500">${Number(plan.price).toFixed(2)}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                                                    <span>{formatDuration(plan.duration)}</span>
                                                    <span className="px-2 py-1 bg-gray-50 rounded-md border border-gray-100">{plan.speedLimit || 'Unlimited'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar / Recent Transactions */}
                    <div className="col-span-4 flex flex-col gap-10">
                        <div className="bg-white p-8 rounded-4xl border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold font-outfit">Recent Sales</h2>
                                <MoreHorizontal className="w-5 h-5 text-gray-400" />
                            </div>

                            <div className="space-y-6">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-24">
                                        <RefreshCw className="w-6 h-6 text-gray-300 animate-spin" />
                                    </div>
                                ) : recentTransactions.length === 0 ? (
                                    <div className="text-center py-6 text-gray-400 text-sm">No transactions yet.</div>
                                ) : (
                                    recentTransactions.map((tx) => (
                                        <div key={tx.id} className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                                                <Ticket className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-gray-900">{tx.voucherCode || `#${tx.id}`}</h4>
                                                <p className="text-[10px] text-gray-500 font-medium">{tx.planName || 'Direct sale'}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-gray-900">${Number(tx.amount).toFixed(2)}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-50 space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium">Your Earnings (85%)</span>
                                    <span className="text-gray-900 font-bold">${Number(stats.totalRevenue).toFixed(2)}</span>
                                </div>
                                <button className="w-full py-4 bg-orange-400 text-white font-bold rounded-2xl hover:bg-orange-500 transition-all flex items-center justify-center gap-2">
                                    <Ticket className="w-5 h-5" />
                                    Generate Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
