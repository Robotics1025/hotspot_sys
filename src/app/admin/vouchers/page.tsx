"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { AdminGuard } from "@/components/AdminGuard"
import { 
    Ticket, 
    Search, 
    Filter, 
    Plus, 
    Download, 
    MoreVertical,
    Calendar,
    Building2,
    Eye,
    Edit2,
    Trash2,
    AlertCircle,
    CheckCircle2,
    Clock,
    Ban,
    RefreshCw
} from "lucide-react"
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

interface Client {
    id: number;
    name: string;
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
    unused: { label: 'Unused', color: 'bg-blue-100 text-blue-700', icon: Clock },
    active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    expired: { label: 'Expired', color: 'bg-red-100 text-red-700', icon: AlertCircle },
    disabled: { label: 'Disabled', color: 'bg-gray-100 text-gray-700', icon: Ban },
};

export default function AdminVouchersPage() {
    const [vouchers, setVouchers] = useState<Voucher[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0
    })
    
    // Filters
    const [filters, setFilters] = useState({
        clientId: '',
        status: '',
        search: ''
    })
    
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
    const [generateForm, setGenerateForm] = useState({
        clientId: '',
        planId: '',
        quantity: 10
    })

    useEffect(() => {
        fetchVouchers()
        fetchClients()
    }, [filters, pagination.page])

    const fetchVouchers = async () => {
        try {
            setIsLoading(true)
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(filters.clientId && { clientId: filters.clientId }),
                ...(filters.status && { status: filters.status }),
            })

            const res = await fetch(`/api/admin/vouchers?${params}`)
            const data: VouchersResponse = await res.json()
            
            if (res.ok) {
                setVouchers(data.vouchers)
                setPagination(data.pagination)
            } else {
                console.error("Failed to fetch vouchers:", data)
            }
        } catch (error) {
            console.error("Error fetching vouchers:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchClients = async () => {
        try {
            const res = await fetch('/api/admin/clients')
            const data = await res.json()
            if (res.ok) {
                setClients(data)
            }
        } catch (error) {
            console.error("Error fetching clients:", error)
        }
    }

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const days = Math.floor(hours / 24)
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''}`
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`
        return `${Math.floor(seconds / 60)} minutes`
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

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
                            <button 
                                onClick={fetchVouchers}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Refresh</span>
                            </button>
                            
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all">
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                            
                            <button 
                                onClick={() => setIsGenerateModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-[#111111] text-white font-bold rounded-2xl hover:bg-orange-500 transition-all shadow-lg shadow-black/10"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Generate Vouchers</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-4 gap-6">
                        {Object.entries(statusConfig).map(([status, config]) => {
                            const count = vouchers.filter(v => v.status === status).length
                            const Icon = config.icon
                            return (
                                <div key={status} className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{count}</p>
                                            <p className="text-sm text-gray-500 mt-1">{config.label} Vouchers</p>
                                        </div>
                                        <div className={cn("w-12 h-12 rounded-4xl flex items-center justify-center", config.color)}>
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
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by voucher code..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                    />
                                </div>
                            </div>
                            
                            <select
                                value={filters.clientId}
                                onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
                                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            >
                                <option value="">All Clients</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>{client.name}</option>
                                ))}
                            </select>
                            
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
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

                    {/* Vouchers Table */}
                    <div className="bg-white rounded-4xl border border-gray-100 overflow-hidden shadow-sm">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-[400px]">
                                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
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
                                            {vouchers.map((voucher) => {
                                                const StatusIcon = statusConfig[voucher.status].icon
                                                return (
                                                    <tr key={voucher.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="p-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                                                                    <Ticket className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-mono font-bold text-gray-900">{voucher.code}</p>
                                                                    <p className="text-xs text-gray-500">ID: {voucher.id}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        
                                                        <td className="p-6">
                                                            <div className="flex items-center gap-2">
                                                                <Building2 className="w-4 h-4 text-gray-400" />
                                                                <span className="font-medium text-gray-900">{voucher.clientName}</span>
                                                            </div>
                                                        </td>
                                                        
                                                        <td className="p-6">
                                                            <div>
                                                                <p className="font-medium text-gray-900">{voucher.planName}</p>
                                                                <p className="text-sm text-gray-500">
                                                                    ${voucher.planPrice} • {formatDuration(voucher.planDuration)}
                                                                </p>
                                                            </div>
                                                        </td>
                                                        
                                                        <td className="p-6">
                                                            <div className={cn(
                                                                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold",
                                                                statusConfig[voucher.status].color
                                                            )}>
                                                                <StatusIcon className="w-3 h-3" />
                                                                {statusConfig[voucher.status].label}
                                                            </div>
                                                        </td>
                                                        
                                                        <td className="p-6">
                                                            <div className="text-sm text-gray-900">
                                                                {formatDate(voucher.createdAt)}
                                                            </div>
                                                        </td>
                                                        
                                                        <td className="p-6">
                                                            <div className="text-sm text-gray-900">
                                                                {formatDate(voucher.consumedAt)}
                                                            </div>
                                                        </td>
                                                        
                                                        <td className="p-6">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
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

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="border-t border-gray-100 p-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-gray-500">
                                                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} vouchers
                                            </p>
                                            
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                                    disabled={pagination.page === 1}
                                                    className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                >
                                                    Previous
                                                </button>
                                                
                                                {[...Array(pagination.totalPages)].map((_, i) => {
                                                    const pageNum = i + 1
                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => setPagination({ ...pagination, page: pageNum })}
                                                            className={cn(
                                                                "px-3 py-1 text-sm rounded-lg transition-all",
                                                                pageNum === pagination.page
                                                                    ? "bg-orange-500 text-white"
                                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                            )}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    )
                                                })}
                                                
                                                <button
                                                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                                    disabled={pagination.page === pagination.totalPages}
                                                    className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </AdminGuard>
    )
}