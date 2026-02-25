"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { AdminGuard } from "@/components/AdminGuard"
import { Building2, Plus, Search, Mail, Phone, Calendar, MoreVertical, DollarSign } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface Client {
    id: number;
    name: string;
    payoutPhoneNumber: string | null;
    balance: string;
    createdAt: string;
}

export default function AdminClients() {
    const [clients, setClients] = useState<Client[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchClients()
    }, [])

    const fetchClients = async () => {
        try {
            const res = await fetch('/api/admin/clients')
            const data = await res.json()
            setClients(data)
        } catch (error) {
            console.error("Failed to fetch clients:", error)
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
                        <h1 className="text-3xl font-bold font-outfit text-gray-900">Platform Clients</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage and monitor all business partners on the platform.</p>
                    </div>
                </div>

                <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-[400px]">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Clients...</p>
                            </div>
                        </div>
                    ) : clients.length === 0 ? (
                        <div className="flex flex-center justify-center p-20 text-center">
                            <div>
                                <Building2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-400">No Clients Found</h3>
                                <p className="text-gray-400 text-sm">Onboard your first client from the dashboard.</p>
                            </div>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] text-gray-500 uppercase font-black">
                                    <th className="px-8 py-5">Business Name</th>
                                    <th className="px-6 py-5">Payout Contact</th>
                                    <th className="px-6 py-5">Wallet Balance</th>
                                    <th className="px-6 py-5">Join Date</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {clients.map((client) => (
                                    <tr key={client.id} className="group hover:bg-gray-50/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                                                    <Building2 className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-gray-900 font-outfit block">{client.name}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ID: #{client.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                {client.payoutPhoneNumber || "Not Set"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 font-bold text-emerald-600">
                                            ${client.balance || "0.00"}
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(client.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                                <MoreVertical className="w-5 h-5 text-gray-400" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </DashboardLayout>
        </AdminGuard>
    )
}
