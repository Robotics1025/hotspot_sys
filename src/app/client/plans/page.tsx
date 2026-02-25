"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { LayoutDashboard, Plus, Clock, Zap, DollarSign, MoreVertical, Edit2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

const plans = [
    { id: 1, name: "Quick Access", duration: "5 Minutes", speed: "1M/1M", price: "Free", active: true, color: "bg-gray-100" },
    { id: 2, name: "Fast Browse", duration: "1 Hour", speed: "2M/2M", price: "$66", active: true, color: "bg-orange-100" },
    { id: 3, name: "Heavy Stream", duration: "3 Hour", speed: "5M/5M", price: "$56", active: true, color: "bg-indigo-100" },
    { id: 4, name: "Daily Pass", duration: "1 Day", speed: "10M/10M", price: "$51", active: false, color: "bg-emerald-100" },
]

export default function PlansPage() {
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

                <div className="grid grid-cols-4 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col group relative">
                            <button className="absolute top-6 right-6 p-2 hover:bg-gray-50 rounded-xl transition-all">
                                <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>

                            <div className={cn("w-14 h-14 rounded-2xl mb-6 flex items-center justify-center", plan.color)}>
                                <LayoutDashboard className="w-7 h-7 text-gray-900" />
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold font-outfit text-gray-900 mb-2">{plan.name}</h3>
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full w-fit">
                                    {plan.active ? "Enabled" : "Disabled"}
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Duration</p>
                                        <p className="text-xs font-bold text-gray-700">{plan.duration}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                        <Zap className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Speed Limit</p>
                                        <p className="text-xs font-bold text-gray-700">{plan.speed}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Price</p>
                                        <p className="text-xs font-bold text-gray-700">{plan.price}</p>
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
            </div>
        </DashboardLayout>
    )
}
