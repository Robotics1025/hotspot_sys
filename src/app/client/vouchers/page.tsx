"use client"

import { useState, useEffect, useRef } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { Ticket, Search, Plus, Filter, Download, MoreVertical, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = ["all", "active", "unused", "expired"];

const vouchers = [
        { id: 1, code: "FAST-8KB2", planName: "1 Hour Plan", planPrice: 51, status: "active", consumedAt: "2026-02-24T12:45:00Z", expiresAt: "2026-02-24T13:45:00Z" },
        { id: 2, code: "FAST-9P1M", planName: "3 Hour Plan", planPrice: 56, status: "unused", consumedAt: null, expiresAt: null },
        { id: 3, code: "FAST-2ZM5", planName: "1 Day Plan", planPrice: 66, status: "expired", consumedAt: "2026-02-23T09:12:00Z", expiresAt: "2026-02-24T09:12:00Z" },
        { id: 4, code: "FAST-LX4K", planName: "1 Hour Plan", planPrice: 51, status: "unused", consumedAt: null, expiresAt: null },
];

const statusConfig = {
    active: { label: "Active", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: Ticket },
    unused: { label: "Unused", color: "bg-gray-100 text-gray-700 border-gray-200", icon: Ticket },
    expired: { label: "Expired", color: "bg-rose-100 text-rose-700 border-rose-200", icon: Ticket },
    disabled: { label: "Disabled", color: "bg-gray-200 text-gray-400 border-gray-300", icon: Ticket },
};

function formatDate(date: string | null) {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleString();
}

export default function VouchersPage() {
    const [activeTab, setActiveTab] = useState("all");
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, total: vouchers.length, totalPages: 1 });

    // Filter vouchers by tab and search
    const filteredVouchers = vouchers.filter((v) => {
        const matchesTab = activeTab === "all" || v.status === activeTab;
        const matchesSearch = v.code.toLowerCase().includes(search.toLowerCase());
        return matchesTab && matchesSearch;
    });

    // Placeholder for fetchVouchers
    const fetchVouchers = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 500);
    };

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
                        {tabs.map((tab: string) => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setPagination((p: typeof pagination) => ({ ...p, page: 1 })) }}
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
