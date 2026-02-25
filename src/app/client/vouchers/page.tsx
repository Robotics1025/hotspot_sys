"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { Ticket, Search, Plus, Filter, Download, MoreVertical } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const vouchers = [
    { id: 1, code: "FAST-8KB2", plan: "1 Hour Plan", status: "Active", usedAt: "24 Feb 2026, 12:45", expiresAt: "24 Feb 2026, 13:45" },
    { id: 2, code: "FAST-9P1M", plan: "3 Hour Plan", status: "Unused", usedAt: "-", expiresAt: "-" },
    { id: 3, code: "FAST-2ZM5", plan: "1 Day Plan", status: "Expired", usedAt: "23 Feb 2026, 09:12", expiresAt: "24 Feb 2026, 09:12" },
    { id: 4, code: "FAST-LX4K", plan: "1 Hour Plan", status: "Unused", usedAt: "-", expiresAt: "-" },
]

export default function VouchersPage() {
    const [activeTab, setActiveTab] = useState("all")

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
                        {["all", "active", "unused", "expired"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
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
                            <input type="text" placeholder="Search by code..." className="bg-transparent border-none outline-none text-xs font-medium w-48" />
                        </div>
                        <button className="p-2 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white transition-all">
                            <Filter className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 text-xs font-bold rounded-xl border border-gray-100 hover:bg-white transition-all">
                            <Download className="w-4 h-4" />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>

                {/* Vouchers Table */}
                <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
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
                            {vouchers.map((voucher) => (
                                <tr key={voucher.id} className="group hover:bg-gray-50/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                                                <Ticket className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-gray-900 font-outfit">{voucher.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-sm font-semibold text-gray-600">{voucher.plan}</td>
                                    <td className="px-6 py-6">
                                        <span className={cn(
                                            "px-3 py-1 text-[10px] font-black uppercase rounded-full border",
                                            voucher.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                voucher.status === "Unused" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                    "bg-gray-50 text-gray-400 border-gray-100"
                                        )}>
                                            {voucher.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-xs text-gray-500 font-medium">{voucher.usedAt}</td>
                                    <td className="px-6 py-6 text-xs text-gray-500 font-medium">{voucher.expiresAt}</td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                                            <MoreVertical className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-8 bg-gray-50/30 flex items-center justify-between">
                        <p className="text-xs text-gray-500 font-medium">Showing 4 of 1,248 vouchers</p>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-400 hover:text-black transition-all disabled:opacity-50">Previous</button>
                            <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-400 hover:text-black transition-all">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
