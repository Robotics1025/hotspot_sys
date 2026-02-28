"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import DashboardLayout from "@/components/DashboardLayout"
import { AdminGuard } from "@/components/AdminGuard"
import {
    User,
    Building2,
    Bell,
    Mail,
    Edit2,
    Camera,
    CheckCircle2,
    AlertCircle,
    Lock,
    Eye,
    EyeOff,
    Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminUser {
    id: string
    email: string
    name: string
    role: string
    createdAt: string | null
    lastLoginAt: string | null
    notifEmail: boolean
    notifSystem: boolean
    notifOnboarding: boolean
}

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
    const [activeTab, setActiveTab] = useState("admin")
    const [isEditing, setIsEditing] = useState(false)
    const [adminData, setAdminData] = useState<AdminUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [saveError, setSaveError] = useState("")
    const [formName, setFormName] = useState("")
    const [formEmail, setFormEmail] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [showCurrentPw, setShowCurrentPw] = useState(false)
    const [showNewPw, setShowNewPw] = useState(false)

    // Notification preferences (synced with backend)
    const [notifPrefs, setNotifPrefs] = useState({
        emailNotifications: true,
        systemAlerts: true,
        newClientOnboarding: false,
    })
    const [notifLoading, setNotifLoading] = useState(false)
    const [notifError, setNotifError] = useState("")

    useEffect(() => {
        fetchAdminData()
    }, [])

    const toggleNotif = async (key: keyof typeof notifPrefs) => {
        setNotifLoading(true)
        setNotifError("")
        const next = { ...notifPrefs, [key]: !notifPrefs[key] }
        setNotifPrefs(next)
        // Map frontend keys to backend fields
        const backendMap = {
            emailNotifications: "notifEmail",
            systemAlerts: "notifSystem",
            newClientOnboarding: "notifOnboarding",
        } as const
        try {
            const body: any = {
                [backendMap[key]]: next[key],
            }
            // Always include name and email for backend compatibility
            if (adminData) {
                body.name = adminData.name
                body.email = adminData.email
            }
            const res = await apiClient.put("/api/admin/settings", body)
            if (!res.success) throw new Error(res.error || "Failed to update notification preference")
        } catch (err: any) {
            setNotifError(err.message || "Failed to update notification preference")
        } finally {
            setNotifLoading(false)
        }
    }

    const fetchAdminData = async () => {
        try {
            const res = await apiClient.get<AdminUser>("/api/admin/settings")
            if (!res.success || !res.data) throw new Error(res.error || "Failed to fetch")
            setAdminData(res.data)
            setFormName(res.data.name || "")
            setFormEmail(res.data.email || "")
            setNotifPrefs({
                emailNotifications: res.data.notifEmail ?? true,
                systemAlerts: res.data.notifSystem ?? true,
                newClientOnboarding: res.data.notifOnboarding ?? false,
            })
        } catch (err) {
            console.error("Failed to fetch admin settings:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const cancelEdit = () => {
        setIsEditing(false)
        if (adminData) {
            setFormName(adminData.name || "")
            setFormEmail(adminData.email || "")
        }
        setCurrentPassword("")
        setNewPassword("")
        setSaveError("")
    }

    const handleSave = async () => {
        setIsSaving(true)
        setSaveError("")
        try {
            const body: Record<string, string> = { name: formName, email: formEmail }
            if (newPassword) {
                body.currentPassword = currentPassword
                body.newPassword = newPassword
            }
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData.error || "Failed to save")
            }
            await fetchAdminData()
            setIsEditing(false)
            setCurrentPassword("")
            setNewPassword("")
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (err: unknown) {
            setSaveError(err instanceof Error ? err.message : "Failed to save changes")
        } finally {
            setIsSaving(false)
        }
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "N/A"
        return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    }

    const renderContent = () => {
        switch (activeTab) {
            case "admin":
                return (
                    <div className="space-y-8">
                        {saveSuccess && (
                            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-sm font-bold">
                                <CheckCircle2 className="w-5 h-5 shrink-0" />
                                Changes saved successfully.
                            </div>
                        )}
                        {saveError && (
                            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-sm font-bold">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                {saveError}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-900">Full Name</label>
                                <input
                                    type="text"
                                    value={isLoading ? "..." : formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full p-4 bg-gray-50 border border-transparent rounded-[24px] text-sm focus:bg-white focus:border-orange-500/20 transition-all outline-none disabled:opacity-75"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-900">Admin Role</label>
                                <input
                                    type="text"
                                    value={isLoading ? "..." : (adminData?.role === "super_admin" ? "Platform Owner" : adminData?.role || "Admin")}
                                    disabled
                                    className="w-full p-4 bg-gray-50 border border-transparent rounded-[24px] text-sm outline-none opacity-50 cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-900">Login Email</label>
                                <input
                                    type="email"
                                    value={isLoading ? "..." : formEmail}
                                    onChange={(e) => setFormEmail(e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full p-4 bg-gray-50 border border-transparent rounded-[24px] text-sm focus:bg-white focus:border-orange-500/20 transition-all outline-none disabled:opacity-75"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-900">Account Created</label>
                                <input
                                    type="text"
                                    value={isLoading ? "..." : formatDate(adminData?.createdAt ?? null)}
                                    disabled
                                    className="w-full p-4 bg-gray-50 border border-transparent rounded-[24px] text-sm outline-none opacity-50 cursor-not-allowed"
                                />
                            </div>
                        </div>
                        {isEditing && (
                            <div className="mt-6 p-6 bg-gray-50 rounded-[28px] space-y-6 border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <Lock className="w-4 h-4 text-gray-400" />
                                    <p className="text-xs font-black text-gray-600 uppercase tracking-widest">Change Password (optional)</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-900">Current Password</label>
                                        <div className="relative">
                                            <input
                                                type={showCurrentPw ? "text" : "password"}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="Enter current password"
                                                className="w-full p-4 pr-12 bg-white border border-gray-200 rounded-[20px] text-sm focus:border-orange-500/30 transition-all outline-none"
                                            />
                                            <button onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-900">New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showNewPw ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Enter new password"
                                                className="w-full p-4 pr-12 bg-white border border-gray-200 rounded-[20px] text-sm focus:border-orange-500/30 transition-all outline-none"
                                            />
                                            <button onClick={() => setShowNewPw(!showNewPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )
            case "platform":
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-900">Platform Name</label>
                            <input type="text" defaultValue="FastNet Hotspots" disabled
                                className="w-full p-4 bg-gray-50 border border-transparent rounded-[24px] text-sm outline-none opacity-50 cursor-not-allowed" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-900">Commission Rate</label>
                            <input type="text" defaultValue="15%" disabled
                                className="w-full p-4 bg-gray-50 border border-transparent rounded-[24px] text-sm outline-none opacity-50 cursor-not-allowed" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-900">RADIUS Server IP</label>
                            <input type="text" defaultValue="Managed via environment variables" disabled
                                className="w-full p-4 bg-gray-50 border border-transparent rounded-[24px] text-sm outline-none opacity-50 cursor-not-allowed" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-900">Platform URL</label>
                            <input type="text" defaultValue={typeof window !== 'undefined' ? window.location.hostname : 'fastnet.systems'} disabled
                                className="w-full p-4 bg-gray-50 border border-transparent rounded-[24px] text-sm outline-none opacity-50 cursor-not-allowed" />
                        </div>
                        <div className="md:col-span-2 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-700 font-bold">
                            Platform configuration is managed via environment variables. Contact your deployment administrator to modify these settings.
                        </div>
                    </div>
                )
            case "notification":{
                const items = [
                    { key: "emailNotifications"   as const, label: "Email Notifications",   desc: "Receive platform alerts via support email.",          icon: Mail,      hover: "hover:bg-indigo-50/50 hover:border-indigo-100",  iconColor: "text-indigo-500" },
                    { key: "systemAlerts"          as const, label: "System Alerts",          desc: "In-dashboard push notifications for errors.",          icon: Bell,      hover: "hover:bg-orange-50/50 hover:border-orange-100",  iconColor: "text-orange-500" },
                    { key: "newClientOnboarding"   as const, label: "New Client Onboarding",  desc: "Notify when a new vendor joins.",                      icon: Building2, hover: "hover:bg-blue-50/50 hover:border-blue-100",    iconColor: "text-blue-500" },
                ]
                return (
                    <div className="space-y-6">
                        {notifError && (
                            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-bold mb-2">{notifError}</div>
                        )}
                        {items.map(({ key, label, desc, icon: Icon, hover, iconColor }) => {
                            const on = notifPrefs[key]
                            return (
                                <button
                                    key={key}
                                    onClick={() => toggleNotif(key)}
                                    disabled={notifLoading}
                                    className={`w-full p-6 bg-gray-50 rounded-[32px] flex items-center justify-between group transition-colors border border-transparent ${hover} text-left ${notifLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm ${iconColor}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{label}</p>
                                            <p className="text-xs text-gray-500">{desc}</p>
                                        </div>
                                    </div>
                                    {/* toggle pill */}
                                    <div className={`w-12 h-6 rounded-full p-1 flex transition-all duration-200 ${on ? "bg-emerald-500 justify-end" : "bg-gray-200 justify-start"}`}>
                                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )
            }
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
                                                setSaveError("")
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
                            {activeTab === "admin" && (
                                <div className="flex items-center gap-3">
                                    {isEditing && (
                                        <button
                                            onClick={cancelEdit}
                                            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        onClick={isEditing ? handleSave : () => setIsEditing(true)}
                                        disabled={isSaving}
                                        className={cn(
                                            "flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold border transition-all",
                                            isEditing
                                                ? "bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
                                                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm"
                                        )}
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit2 className="w-4 h-4" />}
                                        {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Edit"}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Profile Header */}
                        {activeTab !== 'notification' && (
                            <div className="flex items-center gap-6 mb-12">
                                <div className="w-24 h-24 bg-[#111111] rounded-3xl flex items-center justify-center relative group overflow-hidden">
                                    <div className="text-white text-4xl font-bold">
                                        {activeTab === 'admin'
                                            ? (adminData?.name?.[0]?.toUpperCase() || 'A')
                                            : 'F'}
                                    </div>
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Camera className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="font-bold text-gray-900 text-lg">
                                        {isLoading ? "Loading..." : (activeTab === 'admin' ? adminData?.name : 'FastNet Hotspots')}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {isLoading ? "" : (activeTab === 'admin' ? adminData?.email : 'fastnet.systems')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {renderContent()}
                    </div>
                </div>
            </div>
        </DashboardLayout>
        </AdminGuard>
    )
}
