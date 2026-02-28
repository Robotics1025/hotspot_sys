"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { Router as RouterIcon, Signal, Wifi, Activity, MoreVertical, Plus, Settings, ShieldCheck, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { ClientGuard } from "@/components/ClientGuard"


const initialRouters = [
    { id: 1, name: "Main Lobby Router", ip: "10.5.10.1", status: "Online", version: "v7.12", users: 45, load: "12%" },
    { id: 2, name: "Cafe WiFi", ip: "10.5.20.1", status: "Online", version: "v6.49", users: 12, load: "5%" },
    { id: 3, name: "Pool Area", ip: "10.5.30.1", status: "Offline", version: "v7.1", users: 0, load: "0%" },
];

function RoutersContent() {
    const [routerList, setRouterList] = useState(initialRouters);
    const fetchRouters = () => {
        // Placeholder for actual fetch logic
        setRouterList(initialRouters);
    };
    // ...existing code...
    return (
        <DashboardLayout>
            <div className="p-8 text-center text-gray-500">Router Management (Coming Soon)</div>
        </DashboardLayout>
    );
}


export default function RoutersPage() {
    return (
        <ClientGuard>
            <RoutersContent />

        </ClientGuard>

    );
}
