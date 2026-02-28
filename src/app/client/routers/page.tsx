"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { Router as RouterIcon, Wifi, Activity, MoreVertical, Plus, Settings, ShieldCheck, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface Router {
    id: number;
    name: string;
    ip: string | null;
    version: string;
    createdAt: string;
    clientName: string | null;
}

export default function RoutersPage() {
    const [routers, setRouters] = useState<Router[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchRouters()
    }, [])

    const fetchRouters = async () => {
        try {
            setIsLoading(true)
            const res = await fetch('/api/admin/routers')
            const data = await res.json()
            if (res.ok) {
                setRouters(data)
            }
        } catch (error) {
            console.error("Error fetching routers:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-gray-900">Router Fleet</h1>
                        <p className="text-gray-500 text-sm mt-1">Monitor and configure your MikroTik Network Access Servers.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchRouters}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Refresh</span>
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-[#111111] text-white font-bold rounded-2xl hover:bg-orange-500 transition-all shadow-lg shadow-black/10">
                            <Plus className="w-5 h-5" />
                            <span>Connect New NAS</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12">
                        <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-[300px]">
                                    <div className="flex flex-col items-center gap-4">
                                        <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Routers...</p>
                                    </div>
                                </div>
                            ) : routers.length === 0 ? (
                                <div className="flex items-center justify-center h-[300px]">
                                    <div className="text-center">
                                        <RouterIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-gray-400">No Routers Connected</h3>
                                        <p className="text-gray-400 text-sm">Connect your first NAS device to get started.</p>
                                    </div>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] text-gray-500 uppercase font-black">
                                            <th className="px-8 py-5">Router Name</th>
                                            <th className="px-6 py-5">IP / Remote Address</th>
                                            <th className="px-6 py-5">Status</th>
                                            <th className="px-6 py-5">Version</th>
                                            <th className="px-6 py-5">Client</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {routers.map((router) => (
                                            <tr key={router.id} className="group hover:bg-gray-50/30 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                                                            <RouterIcon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-gray-900 font-outfit block">{router.name}</span>
                                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">MikroTik NAS</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-sm font-semibold text-gray-600 font-mono">
                                                    {router.ip || '—'}
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[10px] font-black uppercase text-emerald-600">Online</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-xs text-gray-500 font-bold">
                                                    RouterOS {router.version}
                                                </td>
                                                <td className="px-6 py-6 text-sm text-gray-600 font-medium">
                                                    {router.clientName || '—'}
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                                                            <Settings className="w-4 h-4 text-gray-400" />
                                                        </button>
                                                        <button className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                                                            <MoreVertical className="w-4 h-4 text-gray-400" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Info Cards */}
                    <div className="col-span-4 bg-orange-500 p-8 rounded-[32px] text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4">
                            <Wifi className="w-48 h-48" />
                        </div>
                        <div className="relative z-10">
                            <ShieldCheck className="w-12 h-12 mb-6" />
                            <h3 className="text-2xl font-bold font-outfit mb-2">RADIUS Ready</h3>
                            <p className="text-white/80 text-sm leading-relaxed mb-8">
                                All your routers are successfully delegating AAA requests to the central VPS.
                            </p>
                            <button className="px-6 py-3 bg-white text-orange-500 font-bold rounded-2xl hover:bg-orange-50 transition-all text-sm">
                                View RADIUS Log
                            </button>
                        </div>
                    </div>

                    <div className="col-span-4 bg-[#111111] p-8 rounded-[32px] text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <Activity className="w-12 h-12 text-orange-500 mb-6" />
                            <h3 className="text-2xl font-bold font-outfit mb-2">Performance</h3>
                            <p className="text-white/60 text-sm leading-relaxed mb-8">
                                Your network load is balanced across {routers.length} active router{routers.length !== 1 ? 's' : ''}.
                            </p>
                            <div className="flex items-end gap-4">
                                <div className="text-4xl font-bold font-outfit">98.2%</div>
                                <div className="text-emerald-500 text-sm font-bold mb-1">Uptime</div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-4 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold font-outfit text-gray-900 mb-6">Real-time Usage</h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 font-medium">Download</span>
                                <span className="text-sm font-black text-gray-900">45.2 Mbps</span>
                            </div>
                            <div className="w-full h-24 bg-gray-50 rounded-2xl overflow-hidden relative">
                                <div className="absolute inset-0 flex items-end px-2 gap-1">
                                    {[40, 60, 30, 80, 50, 45, 70, 90, 40, 60].map((h, i) => (
                                        <div key={i} className="flex-1 bg-orange-100 rounded-t-sm" style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 font-medium">Upload</span>
                                <span className="text-sm font-black text-gray-900">12.8 Mbps</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
