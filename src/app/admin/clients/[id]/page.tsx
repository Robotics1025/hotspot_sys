"use client"

import { useRouter, useParams, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { Copy } from "lucide-react"

export default function ClientDetailPage() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const [client, setClient] = useState<any>(null)
    const [routers, setRouters] = useState<any[]>([])
    const [credentials, setCredentials] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const id = params.id
    const password = searchParams.get("password") // Only available after creation

    useEffect(() => {
        if (!id) return
        fetch(`/api/admin/clients?id=${id}`)
            .then(res => res.json())
            .then(data => {
                setClient(data.client)
                setRouters(data.routers || [])
                if (password) setCredentials({ email: data.client.email, password })
            })
            .finally(() => setLoading(false))
    }, [id, password])

    function copy(text: string) {
        navigator.clipboard.writeText(text)
    }

    if (loading) return <DashboardLayout><div>Loading...</div></DashboardLayout>
    if (!client) return <DashboardLayout><div>Client not found.</div></DashboardLayout>

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto mt-12">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                    <h2 className="text-3xl font-extrabold mb-6 flex items-center gap-2">
                        <span>Client Details</span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">ID: {client.id}</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <div className="text-gray-500 font-semibold">Business Name</div>
                            <div className="text-lg font-bold">{client.name}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 font-semibold">Payout Phone</div>
                            <div className="flex items-center gap-2 text-lg">
                                <span>{client.payoutPhoneNumber || 'N/A'}</span>
                                {client.payoutPhoneNumber && (
                                    <button onClick={() => copy(client.payoutPhoneNumber)} title="Copy phone"><Copy className="w-4 h-4 text-gray-400 hover:text-gray-700" /></button>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500 font-semibold">Wallet Balance</div>
                            <div className="text-lg">UGX {client.balance || 0}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 font-semibold">Join Date</div>
                            <div className="text-lg">{client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A'}</div>
                        </div>
                    </div>
                    {credentials && (
                        <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="font-semibold mb-2">Login Credentials</div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-gray-700">{credentials.email}</span>
                                <button onClick={() => copy(credentials.email)} title="Copy email"><Copy className="w-4 h-4 text-gray-400 hover:text-gray-700" /></button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-700">{credentials.password}</span>
                                <button onClick={() => copy(credentials.password)} title="Copy password"><Copy className="w-4 h-4 text-gray-400 hover:text-gray-700" /></button>
                            </div>
                        </div>
                    )}
                    <div>
                        <div className="font-semibold mb-2">Linked Routers</div>
                        {routers.length === 0 ? (
                            <div className="text-gray-500 italic">No routers linked.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm border rounded-xl overflow-hidden">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Name</th>
                                            <th className="px-4 py-2 text-left">IP</th>
                                            <th className="px-4 py-2 text-left">Secret</th>
                                            <th className="px-4 py-2 text-left">Firmware</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {routers.map((router) => (
                                            <tr key={router.id} className="border-b last:border-b-0">
                                                <td className="px-4 py-2 font-medium">{router.name}</td>
                                                <td className="px-4 py-2">{router.ip || 'N/A'}</td>
                                                <td className="px-4 py-2 flex items-center gap-2">
                                                    <span>{router.secret}</span>
                                                    <button onClick={() => copy(router.secret)} title="Copy secret"><Copy className="w-4 h-4 text-gray-400 hover:text-gray-700" /></button>
                                                </td>
                                                <td className="px-4 py-2">{router.version}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
