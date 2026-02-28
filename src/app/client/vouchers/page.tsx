"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { Ticket, Search, Plus, Download, RefreshCw, X, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = ["all", "active", "unused", "expired"];

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
    const [isLoading, setIsLoading] = useState(true);
    const [vouchers, setVouchers] = useState<any[]>([]);

    // Generation Modal State
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [plans, setPlans] = useState<any[]>([]);
    const [genForm, setGenForm] = useState({ planId: "", quantity: 1 });

    useEffect(() => {
        fetchVouchers();
        fetchPlans();
    }, []);

    const fetchVouchers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/client/vouchers');
            if (!res.ok) throw new Error("Failed to fetch vouchers");
            const data = await res.json();
            setVouchers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPlans = async () => {
        try {
            const res = await fetch('/api/client/plans');
            if (!res.ok) throw new Error("Failed to fetch plans");
            const data = await res.json();
            setPlans(Array.isArray(data) ? data : []);
            if (data.length > 0) {
                setGenForm(prev => ({ ...prev, planId: data[0].id.toString() }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);
        try {
            const res = await fetch('/api/client/vouchers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: parseInt(genForm.planId),
                    quantity: genForm.quantity
                })
            });

            if (!res.ok) throw new Error("Failed to generate vouchers");

            setIsGenerateModalOpen(false);
            setGenForm({ ...genForm, quantity: 1 });
            fetchVouchers(); // refresh list
        } catch (error) {
            console.error(error);
            alert("Failed to generate vouchers");
        } finally {
            setIsGenerating(false);
        }
    };

    // Filter vouchers by tab and search
    const filteredVouchers = vouchers.filter((v: any) => {
        const matchesTab = activeTab === "all" || v.status === activeTab;
        const matchesSearch = v.code.toLowerCase().includes(search.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-gray-900">Voucher Management</h1>
                        <p className="text-gray-500 text-sm mt-1">Generate and track internet vouchers for your customers.</p>
                    </div>
                    <button
                        onClick={() => setIsGenerateModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-[#111111] text-white font-bold rounded-2xl hover:bg-orange-500 transition-all shadow-lg shadow-black/10"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Generate Vouchers</span>
                    </button>
                </div>

                {/* Filters & Actions */}
                <div className="flex items-center justify-between bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-100 hidden md:flex">
                        {tabs.map((tab: string) => (
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

                    <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto">
                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 focus-within:bg-white transition-all">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search code..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-transparent border-none outline-none text-xs font-medium w-32 md:w-48"
                            />
                        </div>
                        <button
                            onClick={fetchVouchers}
                            className="p-2 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white transition-all"
                        >
                            <RefreshCw className={cn("w-4 h-4 text-gray-600", isLoading && "animate-spin")} />
                        </button>
                    </div>
                </div>

                {/* Vouchers Table */}
                <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm overflow-x-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-[400px]">
                            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                        </div>
                    ) : filteredVouchers.length === 0 ? (
                        <div className="flex items-center justify-center h-[300px]">
                            <div className="text-center">
                                <Ticket className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-400">No Vouchers Found</h3>
                            </div>
                        </div>
                    ) : (
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Code</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Plan</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Price</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Generated</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredVouchers.map((v: any) => {
                                    const statusObj = statusConfig[v.status as keyof typeof statusConfig] || statusConfig.disabled;
                                    return (
                                        <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center border", statusObj.color)}>
                                                        <statusObj.icon className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-mono font-bold text-gray-900">{v.code}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-900">{v.planName || "Unknown Plan"}</p>
                                                {v.planSpeedLimit && <p className="text-xs text-gray-500">{v.planSpeedLimit}</p>}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900">
                                                UGX {Number(v.planPrice || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                    statusObj.color
                                                )}>
                                                    {statusObj.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                                {formatDate(v.createdAt)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Generate Vouchers Modal */}
            {isGenerateModalOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in" onClick={() => !isGenerating && setIsGenerateModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 border border-white/20">
                        <div className="p-8 pb-0 flex items-center justify-between">
                            <h2 className="text-2xl font-bold font-outfit text-gray-900">Generate Stock</h2>
                            <button onClick={() => !isGenerating && setIsGenerateModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleGenerate} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-2">Select Plan</label>
                                <select
                                    value={genForm.planId}
                                    onChange={(e) => setGenForm({ ...genForm, planId: e.target.value })}
                                    required
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none font-medium text-gray-900"
                                >
                                    {plans.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (UGX {Number(p.price).toLocaleString()})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-2">Quantity to Generate</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="500"
                                    value={genForm.quantity}
                                    onChange={(e) => setGenForm({ ...genForm, quantity: parseInt(e.target.value) || 1 })}
                                    required
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none font-bold text-gray-900"
                                />
                                <p className="text-xs text-amber-600 font-medium pl-2 mt-2">
                                    Note: Generating vouchers will automatically incur a 10% platform commission on total retail value.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isGenerating || !genForm.planId}
                                className="w-full flex items-center justify-center gap-2 px-8 py-5 bg-[#111111] text-white font-bold rounded-[22px] hover:bg-orange-500 transition-all shadow-xl shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isGenerating ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Zap className="w-5 h-5 text-orange-500 group-hover:text-white" />
                                )}
                                <span>{isGenerating ? "Generating..." : "Generate Vouchers"}</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
