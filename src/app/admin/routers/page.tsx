"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { AdminGuard } from "@/components/AdminGuard"
import { Router as RouterIcon, Signal, Wifi, Activity, MoreVertical, Plus, Settings, ShieldCheck, Building2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface RouterDevice {
    id: number;
    name: string;
    clientName: string;
    ip: string;
    version: string;
    createdAt: string;
}

export default function AdminRoutersPage() {
    const [routers, setRouters] = useState<RouterDevice[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchRouters()
    }, [])

    const fetchRouters = async () => {
        try {
            const res = await fetch('/api/admin/routers')
            const data = await res.json()
            setRouters(data)
        } catch (error) {
            console.error("Failed to fetch routers:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AdminGuard>
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-gray-900">Global Router Fleet</h1>
                        <p className="text-gray-500 text-sm mt-1">Cross-platform monitoring of all client MikroTik NAS deployments.</p>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12">
                        <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-[400px]">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Scanning Nodes...</p>
                                    </div>
                                </div>
                            ) : routers.length === 0 ? (
                                <div className="flex items-center justify-center h-[400px]">
                                    <div className="text-center">
                                        <RouterIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-gray-400">No Routers Configured</h3>
                                        <p className="text-gray-400 text-sm">Deploy your first router from the script generator.</p>
                                    </div>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] text-gray-500 uppercase font-black">
                                            <th className="px-8 py-5">Router Name</th>
                                            <th className="px-4 py-5">Client Name</th>
                                            <th className="px-6 py-5">IP / Remote Address</th>
                                            <th className="px-6 py-5">Status</th>
                                            <th className="px-6 py-5">Firmware</th>
                                            <th className="px-6 py-5">Deployed</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {routers.map((router) => (
                                            <tr key={router.id} className="group hover:bg-gray-50/30 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                                            <RouterIcon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-gray-900 font-outfit block">{router.name}</span>
                                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">MikroTik NAS</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm font-semibold text-gray-700">{router.clientName || "Unknown Business"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-sm font-semibold text-gray-600 font-mono">{router.ip || "Direct Access"}</td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[10px] font-black uppercase text-emerald-600">Online</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-xs text-gray-500 font-bold">{router.version}</td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(router.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button className="px-4 py-2 bg-gray-50 text-gray-900 text-[10px] font-bold rounded-xl hover:bg-gray-900 hover:text-white transition-all">
                                                        Debug
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Static Platform Stats kept for visual weight */}
                    <div className="col-span-12 lg:col-span-4 bg-orange-500 p-8 rounded-[32px] text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4">
                            <Wifi className="w-48 h-48" />
                        </div>
                        <div className="relative z-10">
                            <ShieldCheck className="w-12 h-12 mb-6" />
                            <h3 className="text-2xl font-bold font-outfit mb-2">Global RADIUS</h3>
                            <p className="text-white/80 text-sm leading-relaxed mb-8">
                                Managing cloud sessions with high stability across all active nodes.
                            </p>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-4 bg-[#111111] p-8 rounded-[32px] text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <Activity className="w-12 h-12 text-orange-500 mb-6" />
                            <h3 className="text-2xl font-bold font-outfit mb-2">Network Load</h3>
                            <p className="text-white/60 text-sm leading-relaxed mb-8">
                                Peak traffic detected at urban locations. Auto-scaling in effect.
                            </p>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold font-outfit text-gray-900 mb-6">System Health</h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 font-medium">Uptime Status</span>
                                <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">99.9%</span>
                            </div>
                            <div className="w-full h-4 bg-gray-50 rounded-full overflow-hidden flex">
                                <div className="h-full bg-emerald-500" style={{ width: "99%" }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
        </AdminGuard>
    )
}
