"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { AdminGuard } from "@/components/AdminGuard"
import {
    Bell,
    AlertCircle,
    CheckCircle2,
    Info,
    User,
    Shield,
    Zap,
    Search,
    Filter,
    MoreVertical,
    Trash2,
    Activity,
    ArrowUpRight,
    Server,
    Clock,
    SearchCheck
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface Notification {
    id: string
    title: string
    description: string
    time: string
    type: "user" | "payment" | "system"
    priority: "high" | "medium" | "low" | "critical"
    unread: boolean
}

function getNotifStyle(type: Notification["type"]) {
    if (type === "user") return { icon: User, color: "text-blue-500", bg: "bg-blue-50/50" }
    if (type === "payment") return { icon: Zap, color: "text-amber-500", bg: "bg-amber-50/50" }
    return { icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50/50" }
}

export default function NotificationsPage() {
    const [filter, setFilter] = useState("all")
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin/notifications')
            .then(r => r.json())
            .then(data => setNotifications(Array.isArray(data) ? data : []))
            .catch(console.error)
            .finally(() => setIsLoading(false))
    }, [])

    const filtered = notifications.filter(n => {
        if (filter === "all") return true
        if (filter === "unread") return n.unread
        if (filter === "important") return n.priority === "high" || n.priority === "critical"
        return n.type === filter
    })

    const alertCount = notifications.filter(n => n.priority === "critical" || n.priority === "high").length
    const pendingCount = notifications.filter(n => n.type === "payment").length
    const userCount = notifications.filter(n => n.type === "user").length

    const systemMetrics = [
        { name: "Active Alerts", value: String(alertCount), status: alertCount > 0 ? "Action Needed" : "Clear", icon: AlertCircle, color: alertCount > 0 ? "text-rose-500" : "text-emerald-500", bg: alertCount > 0 ? "bg-rose-50" : "bg-emerald-50" },
        { name: "New Clients", value: String(userCount), status: "Registered", icon: User, color: "text-blue-500", bg: "bg-blue-50" },
        { name: "Total Events", value: String(notifications.length), status: "Tracked", icon: Activity, color: "text-indigo-500", bg: "bg-indigo-50" },
        { name: "Payout Queue", value: String(pendingCount), status: "Pending", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
    ]

    return (
        <AdminGuard>
        <DashboardLayout>
            <div className="flex flex-col gap-10 max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/20">
                                <Bell className="w-5 h-5" />
                            </div>
                            <h1 className="text-3xl font-bold font-outfit text-gray-900">Notifications</h1>
                        </div>
                        <p className="text-gray-500 font-medium text-sm">Platform-wide alert system and infrastructure events.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                            Mark as Read
                        </button>
                        <button className="px-6 py-3 bg-[#111111] text-white rounded-2xl text-xs font-bold shadow-xl shadow-black/10 hover:bg-black transition-all">
                            Notification Settings
                        </button>
                    </div>
                </div>

                {/* System Metrics Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {systemMetrics.map((metric) => (
                        <div key={metric.name} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="flex items-center gap-4 relative z-10">
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", metric.bg, metric.color)}>
                                    <metric.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{metric.name}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold text-gray-900 font-outfit">{metric.value}</span>
                                        <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase", metric.bg, metric.color)}>
                                            {metric.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                                <metric.icon className="w-24 h-24" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main List Container */}
                <div className="flex flex-col gap-6">
                    {/* Controls */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-2 p-1.5 bg-gray-100/50 backdrop-blur-sm rounded-[20px] border border-gray-100">
                            {["all", "unread", "system", "important"].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={cn(
                                        "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        filter === f
                                            ? "bg-[#111111] text-white shadow-xl shadow-black/20"
                                            : "text-gray-400 hover:text-gray-600"
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full md:w-96 group">
                            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-orange-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search platform events..."
                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-100 rounded-[20px] text-xs font-bold text-gray-900 shadow-sm focus:border-orange-500/20 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Notification Stream */}
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="py-16 text-center text-gray-400 text-sm">Loading notifications...</div>
                        ) : filtered.length === 0 ? (
                            <div className="py-20 text-center bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-100">
                                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 text-gray-200">
                                    <SearchCheck className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold font-outfit text-gray-900 mb-2">No events</h3>
                                <p className="text-gray-500 font-medium text-sm max-w-xs mx-auto">No notifications match this filter right now.</p>
                            </div>
                        ) : filtered.map((notif) => {
                            const style = getNotifStyle(notif.type)
                            const IconComponent = style.icon
                            return (
                            <div
                                key={notif.id}
                                className={cn(
                                    "group relative p-6 bg-white border border-gray-100 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-black/5 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-6",
                                    notif.unread && "border-l-4 border-l-orange-500"
                                )}
                            >
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                                    style.bg, style.color
                                )}>
                                    <IconComponent className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                                {notif.title}
                                            </h3>
                                            {notif.unread && (
                                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                                            )}
                                            {notif.priority === 'critical' && (
                                                <div className="px-2 py-0.5 bg-rose-500 text-white text-[8px] font-black rounded-lg uppercase tracking-widest">
                                                    Critical
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase">
                                            <Clock className="w-3 h-3" />
                                            {notif.time}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 leading-relaxed font-medium line-clamp-1 group-hover:line-clamp-none transition-all duration-500">
                                        {notif.description}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                    <button className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-orange-50 hover:text-orange-500 transition-all">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                    <button className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>


                </div>
            </div>
        </DashboardLayout>
        </AdminGuard>
    )
}
