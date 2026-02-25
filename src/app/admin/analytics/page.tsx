"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { AdminGuard } from "@/components/AdminGuard"
import { 
    BarChart3,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Ticket,
    Router,
    Calendar,
    Download,
    RefreshCw,
    Filter,
    Eye,
    Building2,
    Clock,
    Target,
    Zap,
    Activity,
    PieChart,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface AnalyticsData {
    period: number;
    summary: {
        totalRevenue: number;
        totalCommission: number;
        totalPayout: number;
        transactionCount: number;
    };
    revenueByDay: Array<{
        date: string;
        totalAmount: number;
        totalCommission: number;
        totalPayout: number;
        transactionCount: number;
    }>;
    vouchersByDay: Array<{
        date: string;
        totalVouchers: number;
        activeVouchers: number;
        unusedVouchers: number;
        expiredVouchers: number;
    }>;
    topPlans: Array<{
        planId: number;
        planName: string;
        planPrice: number;
        voucherCount: number;
        totalRevenue: number;
        clientName: string;
    }>;
    topClients: Array<{
        clientId: number;
        clientName: string;
        totalRevenue: number;
        totalPayout: number;
        transactionCount: number;
        voucherCount: number;
    }>;
}

const periods = [
    { label: "Last 7 Days", value: "7" },
    { label: "Last 30 Days", value: "30" },
    { label: "Last 90 Days", value: "90" },
]

export default function AdminAnalyticsPage() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [selectedPeriod, setSelectedPeriod] = useState("30")

    useEffect(() => {
        fetchAnalytics()
    }, [selectedPeriod])

    const fetchAnalytics = async () => {
        try {
            setIsLoading(true)
            const res = await fetch(`/api/admin/analytics?period=${selectedPeriod}`)
            const data = await res.json()
            
            if (res.ok) {
                setAnalytics(data)
            } else {
                console.error("Failed to fetch analytics:", data)
            }
        } catch (error) {
            console.error("Error fetching analytics:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    const formatNumber = (num: number) => {
        return num.toLocaleString('en-US')
    }

    const getGrowthPercentage = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0
        return ((current - previous) / previous) * 100
    }

    // Mock previous period data for growth calculation
    const mockPreviousRevenue = analytics ? analytics.summary.totalRevenue * 0.85 : 0
    const mockPreviousTransactions = analytics ? analytics.summary.transactionCount * 0.92 : 0

    const revenueGrowth = analytics ? getGrowthPercentage(analytics.summary.totalRevenue, mockPreviousRevenue) : 0
    const transactionGrowth = analytics ? getGrowthPercentage(analytics.summary.transactionCount, mockPreviousTransactions) : 0

    if (isLoading) {
        return (
            <AdminGuard>
                <DashboardLayout>
                    <div className="flex items-center justify-center h-[600px]">
                        <div className="flex items-center gap-3">
                            <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
                            <span className="text-gray-500">Loading analytics data...</span>
                        </div>
                    </div>
                </DashboardLayout>
            </AdminGuard>
        )
    }

    return (
        <AdminGuard>
            <DashboardLayout>
                <div className="flex flex-col gap-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold font-outfit text-gray-900">Analytics Dashboard</h1>
                            <p className="text-gray-500 text-sm mt-1">Comprehensive insights into platform performance and revenue.</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            >
                                {periods.map((period) => (
                                    <option key={period.value} value={period.value}>
                                        {period.label}
                                    </option>
                                ))}
                            </select>
                            
                            <button 
                                onClick={fetchAnalytics}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Refresh</span>
                            </button>
                            
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all">
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>

                    {analytics && (
                        <>
                            {/* Key Metrics */}
                            <div className="grid grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-4xl flex items-center justify-center">
                                            <DollarSign className="w-6 h-6" />
                                        </div>
                                        <div className={cn(
                                            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
                                            revenueGrowth >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                        )}>
                                            {revenueGrowth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {Math.abs(revenueGrowth).toFixed(1)}%
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.summary.totalRevenue)}</p>
                                        <p className="text-sm text-gray-500 mt-1">Total Revenue</p>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-4xl flex items-center justify-center">
                                            <PieChart className="w-6 h-6" />
                                        </div>
                                        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                                            15%
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.summary.totalCommission)}</p>
                                        <p className="text-sm text-gray-500 mt-1">Platform Commission</p>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-4xl flex items-center justify-center">
                                            <Activity className="w-6 h-6" />
                                        </div>
                                        <div className={cn(
                                            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
                                            transactionGrowth >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                        )}>
                                            {transactionGrowth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {Math.abs(transactionGrowth).toFixed(1)}%
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.summary.transactionCount)}</p>
                                        <p className="text-sm text-gray-500 mt-1">Total Transactions</p>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-4xl flex items-center justify-center">
                                            <Target className="w-6 h-6" />
                                        </div>
                                        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                                            85%
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.summary.totalPayout)}</p>
                                        <p className="text-sm text-gray-500 mt-1">Client Payouts</p>
                                    </div>
                                </div>
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-2 gap-8">
                                {/* Revenue Chart */}
                                <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold font-outfit text-gray-900">Daily Revenue</h2>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                            <span>Revenue</span>
                                            <div className="w-3 h-3 bg-orange-500 rounded-full ml-4"></div>
                                            <span>Commission</span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {analytics.revenueByDay.slice(-7).map((day, index) => (
                                            <div key={day.date} className="flex items-center gap-4">
                                                <div className="w-20 text-sm text-gray-500">
                                                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </div>
                                                <div className="flex-1 bg-gray-100 rounded-full h-2 relative overflow-hidden">
                                                    <div 
                                                        className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full"
                                                        style={{ width: `${Math.min(100, (day.totalAmount / Math.max(...analytics.revenueByDay.map(d => d.totalAmount))) * 100)}%` }}
                                                    ></div>
                                                </div>
                                                <div className="w-20 text-sm font-medium text-gray-900 text-right">
                                                    {formatCurrency(day.totalAmount)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Voucher Activity Chart */}
                                <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold font-outfit text-gray-900">Daily Voucher Activity</h2>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            <span>Generated</span>
                                            <div className="w-3 h-3 bg-emerald-500 rounded-full ml-4"></div>
                                            <span>Active</span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {analytics.vouchersByDay.slice(-7).map((day) => (
                                            <div key={day.date} className="flex items-center gap-4">
                                                <div className="w-20 text-sm text-gray-500">
                                                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </div>
                                                <div className="flex-1 bg-gray-100 rounded-full h-2 relative overflow-hidden">
                                                    <div 
                                                        className="absolute left-0 top-0 h-full bg-blue-500 rounded-full"
                                                        style={{ width: `${Math.min(100, (day.totalVouchers / Math.max(...analytics.vouchersByDay.map(d => d.totalVouchers))) * 100)}%` }}
                                                    ></div>
                                                </div>
                                                <div className="w-16 text-sm font-medium text-gray-900 text-right">
                                                    {formatNumber(day.totalVouchers)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Performance Tables */}
                            <div className="grid grid-cols-2 gap-8">
                                {/* Top Performing Plans */}
                                <div className="bg-white rounded-4xl border border-gray-100 overflow-hidden shadow-sm">
                                    <div className="p-6 border-b border-gray-100">
                                        <h2 className="text-xl font-bold font-outfit text-gray-900">Top Performing Plans</h2>
                                        <p className="text-sm text-gray-500 mt-1">Best selling plans by revenue</p>
                                    </div>
                                    
                                    <div className="divide-y divide-gray-50">
                                        {analytics.topPlans.slice(0, 5).map((plan, index) => (
                                            <div key={plan.planId} className="p-6 hover:bg-gray-50/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-sm font-bold">
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{plan.planName}</p>
                                                            <p className="text-sm text-gray-500">{plan.clientName}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-gray-900">{formatCurrency(plan.totalRevenue)}</p>
                                                        <p className="text-sm text-gray-500">{formatNumber(plan.voucherCount)} sales</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Top Clients */}
                                <div className="bg-white rounded-4xl border border-gray-100 overflow-hidden shadow-sm">
                                    <div className="p-6 border-b border-gray-100">
                                        <h2 className="text-xl font-bold font-outfit text-gray-900">Top Clients</h2>
                                        <p className="text-sm text-gray-500 mt-1">Highest revenue generating partners</p>
                                    </div>
                                    
                                    <div className="divide-y divide-gray-50">
                                        {analytics.topClients.slice(0, 5).map((client, index) => (
                                            <div key={client.clientId} className="p-6 hover:bg-gray-50/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-sm font-bold">
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{client.clientName}</p>
                                                            <p className="text-sm text-gray-500">{formatNumber(client.voucherCount)} vouchers</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-gray-900">{formatCurrency(client.totalRevenue)}</p>
                                                        <p className="text-sm text-gray-500">{formatNumber(client.transactionCount)} transactions</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DashboardLayout>
        </AdminGuard>
    )
}