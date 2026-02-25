"use client"

import Link from "next/link"
import { useState } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { AdminGuard } from "@/components/AdminGuard"
import {
    User,
    Building2,
    CreditCard,
    Bell,
    Mail,
    Edit2,
    Camera,
    MapPin,
    Clock,
    Globe,
    CheckCircle2,
    Trash2
} from "lucide-react"

import { cn } from "@/lib/utils"

const categories = [
    {
        group: "Settings", items: [
            { id: "admin", name: "Admin Information", icon: User },
            { id: "platform", name: "Platform Information", icon: Building2 },
            { id: "notification", name: "Notification", icon: Bell },
        ]
    }
]

export default function AdminSettings() {
    const [activeTab, setActiveTab] = useState("platform")
    const [isEditing, setIsEditing] = useState(false)

    const renderContent = () => {
        switch (activeTab) {
            case "admin":
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-900">Full Name</label>
                            <input
                                type="text"
                                defaultValue="Super Admin"
                                disabled={!isEditing}
                                className="w-full p-4 bg-gray-50 border border-transparent rounded-[24px] text-sm focus:bg-white focus:border-orange-500/20 transition-all outline-none disabled:opacity-75"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-900">Admin Role</label>
                            <input
                                type="text"
                                defaultValue="Platform Owner"
                                disabled={true}
                                className="w-full p-4 bg-gray-50 border border-transparent rounded-[24px] text-sm outline-none opacity-50 cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-900">Login Email</label>
                            <input
                                type="email"
                                defaultValue="admin@fastnet.io"
                                disabled={!isEditing}
                                className="w-full p-4 bg-gray-50 border border-transparent rounded-[24px] text-sm focus:bg-white focus:border-orange-500/20 transition-all outline-none disabled:opacity-75"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-900">Security Password</label>
                            <button className="w-full p-4 bg-gray-100 text-gray-900 text-sm font-bold rounded-[24px] hover:bg-gray-200 transition-colors">
                                Reset Password
                            </button>
                        </div>
                    </div>
                )
            case "platform":
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-900">Platform Name</label>
                            <input
                                type="text"
                                defaultValue="FastNet Hotspots"
                                disabled={!isEditing}
                                className="w-full p-4 bg-gray-50 border border-transparent rounded-[24px] text-sm focus:bg-white focus:border-orange-500/20 transition-all outline-none disabled:opacity-75"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-900">Business Permit / ID</label>
                            <input
                                type="text"
                                defaultValue="HS-PK-2026-99"
                                disabled={!isEditing}
                                className="w-full p-4 bg-gray-50 border border-transparent rounded-[24px] text-sm focus:bg-white focus:border-orange-500/20 transition-all outline-none disabled:opacity-75"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-900">Phone Number</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-bold border-r pr-3 border-gray-200">
                                    +254
                                </div>
                                <input
                                    type="text"
                                    defaultValue="712 345 678"
                                    disabled={!isEditing}
                                    className="w-full p-4 pl-16 bg-gray-50 border border-transparent rounded-[24px] text-sm focus:bg-white focus:border-orange-500/20 transition-all outline-none disabled:opacity-75"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-900">Public Support Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    defaultValue="support@fastnet.io"
                                    disabled={!isEditing}
                                    className="w-full p-4 pr-12 bg-gray-50 border border-transparent rounded-[24px] text-sm focus:bg-white focus:border-orange-500/20 transition-all outline-none disabled:opacity-75"
                                />
                                <CheckCircle2 className="w-5 h-5 text-indigo-500 absolute right-4 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-bold text-gray-900">Physical Address</label>
                            <textarea
                                defaultValue="Suite 405, Tech Plaza, Nairobi, Kenya"
                                disabled={!isEditing}
                                rows={3}
                                className="w-full p-4 bg-gray-50 border border-transparent rounded-[24px] text-sm focus:bg-white focus:border-orange-500/20 transition-all outline-none disabled:opacity-75 resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-900">Choose Location</label>
                            <div className="w-full h-48 bg-gray-50 rounded-[32px] overflow-hidden relative border border-gray-100 p-2">
                                <div className="absolute inset-2 bg-white rounded-[24px] overflow-hidden">
                                    <div className="w-full h-full bg-[#f8f9fa] flex items-center justify-center">
                                        <div className="relative">
                                            <div className="w-8 h-8 bg-indigo-500 rounded-full animate-ping absolute -inset-1 opacity-25" />
                                            <MapPin className="w-6 h-6 text-indigo-600 relative z-10" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-900">Operational Time</label>
                                <div className="relative">
                                    <Clock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        defaultValue="08.00am - 10.00pm"
                                        disabled={!isEditing}
                                        className="w-full p-4 pl-12 bg-gray-50 border border-transparent rounded-[24px] text-sm focus:bg-white focus:border-orange-500/20 transition-all outline-none disabled:opacity-75"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-900">Platform URL</label>
                                <input
                                    type="text"
                                    defaultValue="hotspot.fastnet.io"
                                    disabled={!isEditing}
                                    className="w-full p-4 bg-gray-50 border border-transparent rounded-[24px] text-sm focus:bg-white focus:border-orange-500/20 transition-all outline-none disabled:opacity-75"
                                />
                            </div>
                        </div>
                    </div>
                )
            case "notification":
                return (
                    <div className="space-y-6">
                        <div className="p-6 bg-gray-50 rounded-[32px] flex items-center justify-between group hover:bg-indigo-50/50 transition-colors border border-transparent hover:border-indigo-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-500">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Email Notifications</p>
                                    <p className="text-xs text-gray-500">Receive platform alerts via support email.</p>
                                </div>
                            </div>
                            <div className="w-12 h-6 bg-emerald-500 rounded-full p-1 flex justify-end">
                                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-[32px] flex items-center justify-between group hover:bg-orange-50/50 transition-colors border border-transparent hover:border-orange-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-orange-500">
                                    <Bell className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">System Alerts</p>
                                    <p className="text-xs text-gray-500">In-dashboard push notifications for errors.</p>
                                </div>
                            </div>
                            <div className="w-12 h-6 bg-emerald-500 rounded-full p-1 flex justify-end">
                                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-[32px] flex items-center justify-between group hover:bg-blue-50/50 transition-colors border border-transparent hover:border-blue-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-500">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">New Client Onboarding</p>
                                    <p className="text-xs text-gray-500">Notify when a new vendor joins.</p>
                                </div>
                            </div>
                            <div className="w-12 h-6 bg-gray-200 rounded-full p-1 flex justify-start">
                                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <AdminGuard>
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold font-outfit text-gray-900">Settings</h1>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search"
                                className="pl-10 pr-4 py-2 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all w-64"
                            />
                            <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                        <div className="px-4 py-2 bg-white rounded-2xl shadow-sm border border-gray-100 text-xs font-bold text-gray-700 flex items-center gap-2">
                            <span>15 May 2026 8:00 am</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 bg-white p-2 rounded-[40px] border border-gray-100 shadow-sm min-h-[800px]">
                    {/* Left Sidebar */}
                    <div className="w-full lg:w-72 shrink-0 p-6 flex flex-col gap-8 border-r border-gray-50">
                        {categories.map((group) => (
                            <div key={group.group} className="flex flex-col gap-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-4">{group.group}</p>
                                <div className="space-y-1">
                                    {group.items.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setActiveTab(item.id)
                                                setIsEditing(false)
                                            }}
                                            className={cn(
                                                "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group",
                                                activeTab === item.id
                                                    ? "bg-[#111111] text-white shadow-xl shadow-black/10"
                                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-white" : "text-gray-400")} />
                                                <span className="text-sm font-bold">{item.name}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 p-8 lg:p-12">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-2xl font-bold font-outfit text-gray-900">
                                {categories.flatMap(g => g.items).find(i => i.id === activeTab)?.name || "Information"}
                            </h2>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold border transition-all",
                                    isEditing
                                        ? "bg-orange-500 text-white border-orange-500"
                                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm"
                                )}
                            >
                                <Edit2 className="w-4 h-4" />
                                {isEditing ? "Save Changes" : "Edit"}
                            </button>
                        </div>

                        {/* Profile Header */}
                        {activeTab !== 'notification' && (
                            <div className="flex items-center gap-6 mb-12">
                                <div className="w-24 h-24 bg-[#111111] rounded-3xl flex items-center justify-center relative group overflow-hidden">
                                    <div className="text-white text-4xl font-bold">
                                        {activeTab === 'admin' ? 'A' : activeTab === 'platform' ? 'F' : 'N'}
                                    </div>
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Camera className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button className="px-6 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50">
                                        Change Photo
                                    </button>
                                    <button className="text-xs font-bold text-rose-500 hover:text-rose-600">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Dynamic Content */}
                        {renderContent()}
                    </div>
                </div>
            </div>
        </DashboardLayout>
        </AdminGuard>
    )
}
