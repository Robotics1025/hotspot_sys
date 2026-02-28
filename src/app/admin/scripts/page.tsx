"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { AdminGuard } from "@/components/AdminGuard"
import { Terminal, Copy, Download, Server, Wifi, ShieldCheck, Check } from "lucide-react"
import { useState, useEffect } from "react"

export default function ScriptManagement() {
    const [copied, setCopied] = useState(false)
    const [radiusIp, setRadiusIp] = useState("loading...")
    const [radiusSecret, setRadiusSecret] = useState("loading...")

    useEffect(() => {
        fetch('/api/admin/config')
            .then(r => r.json())
            .then(data => {
                setRadiusIp(data.radiusIp)
                setRadiusSecret(data.radiusSecret)
                setScriptContent(buildScript(data.radiusIp, data.radiusSecret))
            })
            .catch(() => {
                setRadiusIp("127.0.0.1")
                setRadiusSecret("FastNet-Radius-2026")
            })
    }, [])

    const buildScript = (ip: string, secret: string) => `# FastNet Full System Setup Script (MikroTik RouterOS v6/v7)
# --------------------------------------------------------
# This script configures RADIUS, Hotspot, and Basic Security

/radius
add address=${ip} secret=${secret} service=hotspot timeout=3000ms
/radius incoming
set accept=yes port=3799

/ip hotspot profile
set [ find default=yes ] hotspot-address=10.5.50.1 login-by=http-chap,https name=FastNet_Profile use-radius=yes

/ip hotspot
add address-pool=hs-pool-1 disabled=no interface=bridge-local name=FastNet_Hotspot profile=FastNet_Profile

/ip hotspot user profile
set [ find default=yes ] idle-timeout=none keepalive-timeout=none shared-users=1

/user group
add name=radius-group policy=read,write,api,test,reboot

# System Identity
/system identity set name="FastNet-NAS-01"

# Firewall Protection
/ip firewall filter
add action=accept chain=input comment="Allow RADIUS Traffic" port=3799,1812,1813 protocol=udp
`

    const [scriptContent, setScriptContent] = useState(buildScript("...", "..."))



    const handleCopy = () => {
        navigator.clipboard.writeText(scriptContent)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <AdminGuard>
            <DashboardLayout>
                <div className="flex flex-col gap-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold font-outfit text-gray-900">Script Management</h1>
                            <p className="text-gray-500 text-sm mt-1">Generate and edit setup scripts to link MikroTik routers to the central system.</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
                                <Download className="w-5 h-5" />
                                <span>Download .rsc</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-8">
                        {/* Script Display */}
                        <div className="col-span-8">
                            <div className="bg-[#111111] rounded-[40px] border border-gray-800 overflow-hidden shadow-2xl relative">
                                <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-black/20">
                                    <div className="flex items-center gap-3">
                                        <Terminal className="w-5 h-5 text-orange-500" />
                                        <span className="text-xs font-bold text-gray-400 font-mono tracking-wider">mikrotik_setup_v1.rsc</span>
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white hover:bg-white/10 rounded-xl transition-all text-xs font-bold border border-white/10"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                        <span>{copied ? "Copied!" : "Copy Script"}</span>
                                    </button>
                                </div>
                                <textarea
                                    value={scriptContent}
                                    onChange={(e) => setScriptContent(e.target.value)}
                                    className="w-full h-[600px] p-10 bg-transparent font-mono text-xs text-emerald-500/90 leading-relaxed outline-none resize-none scrollbar-hide"
                                    spellCheck={false}
                                />
                            </div>
                        </div>

                        {/* Sidebar info */}
                        <div className="col-span-4 space-y-6">
                            <div className="bg-orange-500 p-8 rounded-[40px] text-white overflow-hidden relative group">
                                <div className="relative z-10">
                                    <Server className="w-10 h-10 mb-6" />
                                    <h3 className="text-xl font-bold font-outfit mb-3">Central RADIUS VPS</h3>
                                    <p className="text-white/80 text-sm leading-relaxed mb-6">
                                        This script points your router to our global authentication server at <span className="font-black underline">{radiusIp}</span>.
                                    </p>
                                    <div className="p-4 bg-black/10 rounded-2xl border border-white/10 font-mono text-[10px] break-all">
                                        Secret: {radiusSecret}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                    <h3 className="text-lg font-bold font-outfit">Security Note</h3>
                                </div>
                                <ul className="space-y-4">
                                    {[
                                        "Accepts Incoming RADIUS (CoA)",
                                        "Restricts API access to Radius IP",
                                        "Configures Walled Garden for PesaPal",
                                        "Enables SSL/HTTPS for login page",
                                    ].map((note, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                            {note}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100">
                                <div className="flex items-center gap-3 mb-4 text-gray-400">
                                    <Wifi className="w-5 h-5" />
                                    <span className="text-sm font-bold uppercase tracking-wider">Version Compatibility</span>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    This script automatically detects if you are using <span className="text-gray-900 font-bold">RouterOS v6</span> or <span className="text-gray-900 font-bold">v7</span> and applies correct syntax for hotspot profiles.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </AdminGuard>
    )
}
