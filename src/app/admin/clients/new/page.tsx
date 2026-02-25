"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { AdminGuard } from "@/components/AdminGuard"
import { Building2, Save, X, Phone, Key, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AddClient() {
    const router = useRouter()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // In a real app, we would use a server action or API route here
        alert("Client added successfully (Demo)")
        router.push("/admin")
    }

    return (
        <AdminGuard>
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-gray-900">Add New Client</h1>
                        <p className="text-gray-500 text-sm mt-1">Onboard a new business to the FastNet platform.</p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-gray-100 text-gray-500 rounded-2xl hover:bg-gray-200 transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-1">Business Name</label>
                                <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 focus-within:bg-white focus-within:border-orange-500 transition-all">
                                    <Building2 className="w-5 h-5 text-gray-400" />
                                    <input required type="text" placeholder="e.g. Sunset Hotel" className="bg-transparent outline-none flex-1 text-sm font-bold" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-1">Payout Phone (Mobile Money)</label>
                                <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 focus-within:bg-white focus-within:border-orange-500 transition-all">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                    <input required type="tel" placeholder="254..." className="bg-transparent outline-none flex-1 text-sm font-bold" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-50">
                            <div className="flex items-center gap-2 mb-6">
                                <Key className="w-4 h-4 text-orange-500" />
                                <h3 className="text-sm font-bold font-outfit">PesaPal Openfloat Credentials (Optional)</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-1">Consumer Key</label>
                                    <input type="text" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:border-orange-500 focus:bg-white transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-1">Consumer Secret</label>
                                    <input type="password" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:border-orange-500 focus:bg-white transition-all" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-emerald-500">
                                <Shield className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase">Automated 15% Commission Enabled</span>
                            </div>
                            <button type="submit" className="flex items-center gap-2 px-10 py-5 bg-[#111111] text-white font-bold rounded-[22px] hover:bg-orange-500 transition-all shadow-xl shadow-black/10">
                                <Save className="w-5 h-5" />
                                <span>Save Client</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
        </AdminGuard>
    )
}
