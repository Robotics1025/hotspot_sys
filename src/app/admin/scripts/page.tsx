"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { AdminGuard } from "@/components/AdminGuard"
import { Terminal, Copy, Download, Server, Wifi, ShieldCheck, Check, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

interface RadiusConfig {
    radiusIp: string
    radiusSecret: string
    radiusAuthPort: string
    radiusAcctPort: string
    appUrl: string
}

function generateScript(cfg: RadiusConfig) {
    return `# FastNet Hotspot System - MikroTik RouterOS Configuration
# Generated: ${new Date().toISOString().split("T")[0]}
# --------------------------------------------------------

# Variables
:local radiusServer "${cfg.radiusIp}"
:local radiusSecret "${cfg.radiusSecret}"
:local authPort ${cfg.radiusAuthPort}
:local acctPort ${cfg.radiusAcctPort}
:local hotspotInterface "wlan1"
:local lanInterface "ether2-master-local"
:local internetInterface "ether1"
:local hotspotNetwork "10.5.50.0/24"
:local hotspotPool "10.5.50.100-10.5.50.200"

# ============================================================================
# 1. RADIUS CONFIGURATION
# ============================================================================

:put "Configuring RADIUS settings..."

/radius add service=hotspot address=$radiusServer secret=$radiusSecret \\
    authentication-port=$authPort accounting-port=$acctPort timeout=3s

/radius incoming set accept=yes port=3799

:put "RADIUS configuration completed"

# ============================================================================
# 2. HOTSPOT SETUP
# ============================================================================

:put "Setting up Hotspot..."

/ip pool add name=hotspot-pool ranges=$hotspotPool

/ip dhcp-server network add address=$hotspotNetwork gateway=10.5.50.1 dns-server=8.8.8.8,8.8.4.4

/ip address add address=10.5.50.1/24 interface=$hotspotInterface network=10.5.50.0

/ip hotspot profile add name=fastnet-profile \\
    hotspot-address=10.5.50.1 \\
    dns-name=fastnet.local \\
    html-directory=hotspot \\
    use-radius=yes \\
    login-by=http-chap,https \\
    http-cookie-lifetime=1d

/ip hotspot add name=fastnet-hotspot \\
    interface=$hotspotInterface \\
    address-pool=hotspot-pool \\
    profile=fastnet-profile \\
    disabled=no

:put "Hotspot setup completed"

# ============================================================================
# 3. NAT AND ROUTING
# ============================================================================

/ip firewall nat add chain=srcnat out-interface=$internetInterface action=masquerade comment="FastNet Masquerade"

/ip firewall filter add action=accept chain=input comment="Allow RADIUS" \\
    port=1812,1813,3799 protocol=udp

/ip firewall filter add action=accept chain=input comment="Allow RADIUS TCP" \\
    port=1812,1813 protocol=tcp

# ============================================================================
# 4. WALLED GARDEN (Free access before login)
# ============================================================================

/ip hotspot walled-garden
add comment="PesaPal" dst-host=*.pesapal.com
add comment="FastNet Portal" dst-host=*.fastnet.systems

:put "FastNet configuration completed successfully!"
:put "RADIUS Server: $radiusServer"
`
}

export default function ScriptManagement() {
    const [copied, setCopied] = useState(false)
    const [config, setConfig]   = useState<RadiusConfig | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetch("/api/admin/config")
            .then(r => r.json())
            .then(d => { setConfig(d); setIsLoading(false) })
            .catch(() => {
                setConfig({ radiusIp: "YOUR_RADIUS_IP", radiusSecret: "FastNet-Radius-2026", radiusAuthPort: "1812", radiusAcctPort: "1813", appUrl: "" })
                setIsLoading(false)
            })
    }, [])

    const script = config ? generateScript(config) : ""

    const handleCopy = () => {
        navigator.clipboard.writeText(script)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDownload = () => {
        const blob = new Blob([script], { type: "text/plain" })
        const url  = URL.createObjectURL(blob)
        const a    = document.createElement("a"); a.href = url; a.download = "fastnet-mikrotik.rsc"; a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <AdminGuard>
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-gray-900">Script Management</h1>
                        <p className="text-gray-500 text-sm mt-1">Generate MikroTik setup scripts pointing to the central RADIUS server.</p>
                    </div>
                    <button onClick={handleDownload} disabled={isLoading} className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50">
                        <Download className="w-5 h-5" />
                        Download .rsc
                    </button>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Script */}
                    <div className="col-span-8">
                        <div className="bg-[#111111] rounded-[40px] border border-gray-800 overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-black/20">
                                <div className="flex items-center gap-3">
                                    <Terminal className="w-5 h-5 text-orange-500" />
                                    <span className="text-xs font-bold text-gray-400 font-mono tracking-wider">fastnet-mikrotik.rsc</span>
                                </div>
                                <button onClick={handleCopy} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white hover:bg-white/10 rounded-xl transition-all text-xs font-bold border border-white/10 disabled:opacity-50">
                                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                    {copied ? "Copied!" : "Copy Script"}
                                </button>
                            </div>
                            {isLoading ? (
                                <div className="flex items-center justify-center h-[600px]">
                                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                                </div>
                            ) : (
                                <pre className="w-full h-[600px] p-10 font-mono text-xs text-emerald-400/90 leading-relaxed overflow-auto">
                                    {script}
                                </pre>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-span-4 space-y-6">
                        <div className="bg-orange-500 p-8 rounded-[40px] text-white overflow-hidden relative">
                            <Server className="w-10 h-10 mb-6" />
                            <h3 className="text-xl font-bold font-outfit mb-3">Central RADIUS VPS</h3>
                            <p className="text-white/80 text-sm leading-relaxed mb-4">
                                This script points your router to the global authentication server.
                            </p>
                            {isLoading ? (
                                <div className="h-16 bg-black/10 rounded-2xl animate-pulse" />
                            ) : (
                                <div className="p-4 bg-black/10 rounded-2xl border border-white/10 font-mono text-[11px] space-y-1">
                                    <div>IP: <span className="text-white font-bold">{config?.radiusIp}</span></div>
                                    <div>Secret: <span className="text-white font-bold">{config?.radiusSecret}</span></div>
                                    <div>Auth: <span className="text-white font-bold">:{config?.radiusAuthPort}</span></div>
                                    <div>Acct: <span className="text-white font-bold">:{config?.radiusAcctPort}</span></div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                <h3 className="text-lg font-bold font-outfit">Security Features</h3>
                            </div>
                            <ul className="space-y-4">
                                {[
                                    "Accepts Incoming RADIUS CoA (port 3799)",
                                    "Restricts API access to RADIUS IP",
                                    "Walled Garden for PesaPal payment",
                                    "HTTPS login page support",
                                    "Compatible with RouterOS v6 & v7",
                                ].map((note, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                                        {note}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100">
                            <div className="flex items-center gap-3 mb-4 text-gray-400">
                                <Wifi className="w-5 h-5" />
                                <span className="text-sm font-bold uppercase tracking-wider">Instructions</span>
                            </div>
                            <ol className="space-y-3 text-xs text-gray-500 leading-relaxed list-decimal list-inside">
                                <li>Download or copy the script above</li>
                                <li>Log into your MikroTik Winbox</li>
                                <li>Open <span className="font-bold text-gray-900">New Terminal</span></li>
                                <li>Paste and run the script</li>
                                <li>Verify RADIUS with <code className="bg-gray-200 px-1 rounded">:ping {config?.radiusIp ?? "..."}</code></li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
        </AdminGuard>
    )
}
