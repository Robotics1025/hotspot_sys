"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { Router as RouterIcon, Signal, Wifi, Activity, MoreVertical, Plus, Settings, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

const devices = [
    { id: 1, name: "Main Lobby Router", ip: "10.5.10.1", status: "Online", version: "RouterOS v7.12", users: 45, load: "12%" },
    { id: 2, name: "Cafe WiFi", ip: "10.5.20.1", status: "Online", version: "RouterOS v6.49", users: 12, load: "5%" },
    { id: 3, name: "Pool Area", ip: "10.5.30.1", status: "Offline", version: "RouterOS v7.1", users: 0, load: "0%" },
]

export default function RoutersPage() {
    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-gray-900">Router Fleet</h1>
                        <p className="text-gray-500 text-sm mt-1">Monitor and configure your MikroTik Network Access Servers.</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#111111] text-white font-bold rounded-2xl hover:bg-orange-500 transition-all shadow-lg shadow-black/10">
                        <Plus className="w-5 h-5" />
                        <span>Connect New NAS</span>
                    </button>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12">
                        <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] text-gray-500 uppercase font-black">
                                        <th className="px-8 py-5">Router Name</th>
                                        <th className="px-6 py-5">IP / Remote Address</th>
                                        <th className="px-6 py-5">Status</th>
                                        <th className="px-6 py-5">Firmware</th>
                                        <th className="px-6 py-5">Users</th>
                                        <th className="px-6 py-5">Load</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {devices.map((device) => (
                                        <tr key={device.id} className="group hover:bg-gray-50/30 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-2xl flex items-center justify-center",
                                                        device.status === "Online" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"
                                                    )}>
                                                        <RouterIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-gray-900 font-outfit block">{device.name}</span>
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">MikroTik NAS</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-sm font-semibold text-gray-600 font-mono">{device.ip}</td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-2 h-2 rounded-full", device.status === "Online" ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase",
                                                        device.status === "Online" ? "text-emerald-600" : "text-rose-500"
                                                    )}>
                                                        {device.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-xs text-gray-500 font-bold">{device.version}</td>
                                            <td className="px-6 py-6 font-bold text-gray-900">{device.users}</td>
                                            <td className="px-6 py-6">
                                                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full rounded-full transition-all duration-1000", parseInt(device.load) > 50 ? "bg-rose-500" : "bg-emerald-500")}
                                                        style={{ width: device.load }}
                                                    />
                                                </div>
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
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
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
                                Your network load is balanced across 2 active routers.
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
                                {/* Mock Graph */}
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
