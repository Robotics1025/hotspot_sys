
"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { LayoutDashboard, Plus, Clock, Zap, DollarSign, MoreVertical, Edit2, Trash2, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"


type Plan = {
    id: number;
    name: string;
    duration: number;
    price: string | number;
    speedLimit?: string | null;
};

const cardColors = [
    "bg-gray-100",
    "bg-orange-100",
    "bg-indigo-100",
    "bg-emerald-100"
];

function formatDuration(duration: number): string {
    if (duration < 3600) return `${Math.round(duration / 60)} Minutes`
    if (duration < 86400) return `${Math.round(duration / 3600)} Hours`
    if (duration < 604800) return `${Math.round(duration / 86400)} Days`
    if (duration < 2592000) return `${Math.round(duration / 604800)} Weeks`
    return `${Math.round(duration / 2592000)} Months`
}

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchPlans()
    }, [])

    const fetchPlans = async () => {
        try {
            setIsLoading(true)
            const res = await fetch('/api/client/plans')
            const data = await res.json()
            if (res.ok) {
                setPlans(data)
            }
        } catch (error) {
            console.error("Error fetching plans:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-gray-900">Internet Plans</h1>
                        <p className="text-gray-500 text-sm mt-1">Configure your hotspot packages and pricing models.</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#111111] text-white font-bold rounded-2xl hover:bg-orange-500 transition-all shadow-lg shadow-black/10">
                        <Plus className="w-5 h-5" />
                        <span>Create New Plan</span>
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <div className="flex flex-col items-center gap-4">
                            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Plans...</p>
                        </div>
                    </div>
                ) : plans.length === 0 ? (
                    <div className="flex items-center justify-center h-[400px] bg-white rounded-[32px] border border-gray-100">
                        <div className="text-center">
                            <LayoutDashboard className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-400">No Plans Yet</h3>
                            <p className="text-gray-400 text-sm">Create your first plan to get started.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-6">
                        {plans.map((plan, index) => (
                            <div key={plan.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col group relative">
                                <button className="absolute top-6 right-6 p-2 hover:bg-gray-50 rounded-xl transition-all">
                                    <MoreVertical className="w-4 h-4 text-gray-400" />
                                </button>

                                <div className={cn("w-14 h-14 rounded-2xl mb-6 flex items-center justify-center", cardColors[index % cardColors.length])}>
                                    <LayoutDashboard className="w-7 h-7 text-gray-900" />
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-xl font-bold font-outfit text-gray-900 mb-2">{plan.name}</h3>
                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full w-fit">
                                        Enabled
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Duration</p>
                                            <p className="text-xs font-bold text-gray-700">{formatDuration(plan.duration)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                            <Zap className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Speed Limit</p>
                                            <p className="text-xs font-bold text-gray-700">{plan.speedLimit || 'Unlimited'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                            <DollarSign className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Price</p>
                                            <p className="text-xs font-bold text-gray-700">UGX {Number(plan.price).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 border-t border-gray-50 flex gap-2">
                                    <button className="flex-1 py-3 bg-gray-50 text-gray-900 text-xs font-bold rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 border border-gray-100">
                                        <Edit2 className="w-3.5 h-3.5" />
                                        Edit
                                    </button>
                                    <button className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all border border-rose-100">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Create New Placeholder */}
                        <button className="group bg-gray-50 border-2 border-dashed border-gray-200 rounded-[32px] p-6 flex flex-col items-center justify-center gap-4 hover:bg-white hover:border-orange-300 transition-all min-h-[400px]">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <Plus className="w-8 h-8 text-gray-300 group-hover:text-orange-500" />
                            </div>
                            <div className="text-center">
                                <h4 className="font-bold text-gray-400 group-hover:text-gray-900 transition-colors">Create Plan</h4>
                                <p className="text-xs text-gray-400 font-medium">Add a new package</p>
                            </div>
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

