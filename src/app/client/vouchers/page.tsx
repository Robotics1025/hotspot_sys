"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { Ticket, Search, Plus, Download, MoreVertical, RefreshCw, CheckCircle2, Clock, Ban, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface Voucher {
    id: number;
    code: string;
    status: 'unused' | 'active' | 'expired' | 'disabled';
    consumedAt: string | null;
    expiresAt: string | null;
    createdAt: string;
    clientName: string;
    planName: string;
    planPrice: string;
    planDuration: number;
}

interface VouchersResponse {
    vouchers: Voucher[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

const statusConfig = {
    unused: { label: 'Unused', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: Clock },
    active: { label: 'Active', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle2 },
    expired: { label: 'Expired', color: 'bg-gray-50 text-gray-400 border-gray-100', icon: AlertCircle },
    disabled: { label: 'Disabled', color: 'bg-red-50 text-red-400 border-red-100', icon: Ban },
}

const tabs = ['all', 'active', 'unused', 'expired', 'disabled'] as const

function formatDate(dateString: string | null) {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

export default function VouchersPage() {
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'unused' | 'expired' | 'disabled'>('all')
    const [vouchers, setVouchers] = useState<Voucher[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, totalPages: 0 })
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchVouchers()
    }, [activeTab, pagination.page])

    const fetchVouchers = async () => {
        try {
            setIsLoading(true)
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(activeTab !== 'all' && { status: activeTab }),
            })
            const res = await fetch(`/api/admin/vouchers?${params}`)
            const data: VouchersResponse = await res.json()
            if (res.ok) {
                setVouchers(data.vouchers)
                setPagination(data.pagination)
            }
        } catch (error) {
            console.error("Error fetching vouchers:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredVouchers = search
        ? vouchers.filter(v => v.code.toLowerCase().includes(search.toLowerCase()))
        : vouchers

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
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setPagination(p => ({ ...p, page: 1 })) }}
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
                            <input
                                type="text"
                                placeholder="Search by code..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-transparent border-none outline-none text-xs font-medium w-48"
                            />
                        </div>
                        <button
                            onClick={fetchVouchers}
                            className="p-2 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white transition-all"
                        >
                            <RefreshCw className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 text-xs font-bold rounded-xl border border-gray-100 hover:bg-white transition-all">
                            <Download className="w-4 h-4" />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>

                {/* Vouchers Table */}
                <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-[400px]">
                            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                        </div>
                    ) : filteredVouchers.length === 0 ? (
                        <div className="flex items-center justify-center h-[300px]">
                            <div className="text-center">
                                <Ticket className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-400">No Vouchers Found</h3>
                                <p className="text-gray-400 text-sm">Generate some vouchers to get started.</p>
                            </div>
                        </div>
                    ) : (
                        <>
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
                                    {filteredVouchers.map((voucher) => {
                                        const cfg = statusConfig[voucher.status] ?? statusConfig.disabled
                                        const StatusIcon = cfg.icon
                                        return (
                                            <tr key={voucher.id} className="group hover:bg-gray-50/30 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                                                            <Ticket className="w-5 h-5" />
                                                        </div>
                                                        <span className="font-bold text-gray-900 font-mono">{voucher.code}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <p className="text-sm font-semibold text-gray-900">{voucher.planName}</p>
                                                    <p className="text-xs text-gray-400">${Number(voucher.planPrice).toFixed(2)}</p>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <span className={cn(
                                                        "px-3 py-1 text-[10px] font-black uppercase rounded-full border inline-flex items-center gap-1.5",
                                                        cfg.color
                                                    )}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {cfg.label}
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
                                        )
                                    })}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            <div className="p-8 bg-gray-50/30 flex items-center justify-between">
                                <p className="text-xs text-gray-500 font-medium">
                                    Showing {filteredVouchers.length} of {pagination.total} vouchers
                                </p>
                                {pagination.totalPages > 1 && (
                                    <div className="flex gap-2">
                                        <button
                                            disabled={pagination.page === 1}
                                            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                                            className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-400 hover:text-black transition-all disabled:opacity-50"
                                        >Previous</button>
                                        <button
                                            disabled={pagination.page === pagination.totalPages}
                                            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                                            className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-400 hover:text-black transition-all disabled:opacity-50"
                                        >Next</button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
