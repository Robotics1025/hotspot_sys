"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { ClientGuard } from "@/components/ClientGuard"
import { 
    DollarSign, 
    Search, 
    Download, 
    Calendar,
    RefreshCw,
    Check,
    X,
    Clock,
    AlertCircle,
    CreditCard,
    TrendingUp,
    Ticket,
    Filter
} from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface Transaction {
    id: number;
    amount: string;
    commission: string;
    payout: string;
    status: string;
    pesapalReference: string | null;
    createdAt: string;
    clientName: string;
    voucherCode: string | null;
    planName: string | null;
}

interface TransactionSummary {
    totalAmount: number;
    totalCommission: number;
    totalPayout: number;
}

interface TransactionsResponse {
    transactions: Transaction[];
    summary: TransactionSummary;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', icon: Check },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: X },
};

function ClientTransactionsContent() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [summary, setSummary] = useState<TransactionSummary>({
        totalAmount: 0,
        totalCommission: 0,
        totalPayout: 0
    })
    const [isLoading, setIsLoading] = useState(true)
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 30,
        totalPages: 0
    })
    
    // Filters
    const [filters, setFilters] = useState({
        status: '',
        startDate: '',
        endDate: ''
    })

    useEffect(() => {
        fetchTransactions()
    }, [filters, pagination.page])

    const fetchTransactions = async () => {
        try {
            setIsLoading(true)
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(filters.status && { status: filters.status }),
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate }),
            })

            const res = await fetch(`/api/client/transactions?${params}`)
            const data: TransactionsResponse = await res.json()
            
            if (res.ok) {
                setTransactions(data.transactions)
                setSummary(data.summary)
                setPagination(data.pagination)
            } else {
                console.error("Failed to fetch transactions:", data)
            }
        } catch (error) {
            console.error("Error fetching transactions:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const formatCurrency = (amount: string | number) => {
        return `UGX ${Number(amount).toLocaleString()}`
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-gray-900">Transaction History</h1>
                        <p className="text-gray-500 text-sm mt-1">Track your voucher sales and revenue performance.</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={fetchTransactions}
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

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalAmount)}</p>
                                <p className="text-sm text-gray-500 mt-1">Total Revenue</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-4xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalPayout)}</p>
                                <p className="text-sm text-gray-500 mt-1">Your Earnings (85%)</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-4xl flex items-center justify-center">
                                <CreditCard className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{pagination.total.toLocaleString()}</p>
                                <p className="text-sm text-gray-500 mt-1">Total Transactions</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-4xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-4xl border border-gray-100">
                    <div className="flex items-center gap-4">
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                        </select>
                        
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            placeholder="Start Date"
                        />
                        
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            placeholder="End Date"
                        />
                        
                        <button
                            onClick={() => setFilters({ status: '', startDate: '', endDate: '' })}
                            className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Transactions Table */}
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
                                            <th className="text-left p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction</th>
                                            <th className="text-left p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Voucher</th>
                                            <th className="text-left p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Plan</th>
                                            <th className="text-left p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Revenue</th>
                                            <th className="text-left p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Your Earning</th>
                                            <th className="text-left p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="text-left p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {transactions.map((transaction) => {
                                            const StatusIcon = statusConfig[transaction.status as keyof typeof statusConfig]?.icon || AlertCircle
                                            const statusStyle = statusConfig[transaction.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-700'
                                            
                                            return (
                                                <tr key={transaction.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                                                                <DollarSign className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900">#{transaction.id}</p>
                                                                {transaction.pesapalReference && (
                                                                    <p className="text-xs text-gray-500 font-mono">{transaction.pesapalReference}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    
                                                    <td className="p-6">
                                                        {transaction.voucherCode ? (
                                                            <div className="flex items-center gap-2">
                                                                <Ticket className="w-4 h-4 text-gray-400" />
                                                                <span className="font-mono text-sm text-gray-900">{transaction.voucherCode}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    
                                                    <td className="p-6">
                                                        <span className="text-sm text-gray-900">{transaction.planName || '-'}</span>
                                                    </td>
                                                    
                                                    <td className="p-6">
                                                        <span className="font-bold text-gray-900">{formatCurrency(transaction.amount)}</span>
                                                    </td>
                                                    
                                                    <td className="p-6">
                                                        <span className="font-bold text-emerald-600">{formatCurrency(transaction.payout)}</span>
                                                    </td>
                                                    
                                                    <td className="p-6">
                                                        <div className={cn(
                                                            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold",
                                                            statusStyle
                                                        )}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            {statusConfig[transaction.status as keyof typeof statusConfig]?.label || transaction.status}
                                                        </div>
                                                    </td>
                                                    
                                                    <td className="p-6">
                                                        <div className="text-sm text-gray-900">
                                                            {formatDate(transaction.createdAt)}
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
                                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} transactions
                                        </p>
                                        
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                                disabled={pagination.page === 1}
                                                className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                Previous
                                            </button>
                                            
                                            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
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
    )
}

export default function ClientTransactionsPage() {
    return (
        <ClientGuard>
            <ClientTransactionsContent />
        </ClientGuard>
    )
}