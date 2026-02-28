"use client"


import DashboardLayout from "@/components/DashboardLayout"
import { Users, User, Ticket, AlertCircle, Play, MoreHorizontal, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import ClientGuard from "@/components/ClientGuard"

const stats = [
    { name: "Active Users", value: "156", change: "+15.6%", icon: Users, color: "bg-blue-500" },
    { name: "Vouchers Sold", value: "97", change: "+5.6%", icon: Ticket, color: "bg-emerald-500" },
    { name: "Network Alerts", value: "07", change: "-1.1%", icon: AlertCircle, color: "bg-rose-500" },
]

const recentActivity = [
    { id: 1, user: "Nasi Goreng", plan: "1 Hour Plan", price: "$51", status: "Active" },
    { id: 2, user: "Udang Semur", plan: "3 Hour Plan", price: "$56", status: "Active" },
    { id: 3, user: "Meat Ball May", plan: "1 Day Plan", price: "$66", status: "Active" },
]

const popularPlans = [
    { name: "Fast Browse", speed: "2M/2M", price: "$66", duration: "1 Hour", color: "bg-orange-100" },
    { name: "Heavy Stream", speed: "5M/5M", price: "$56", duration: "3 Hour", color: "bg-indigo-100" },
    { name: "Daily Pass", speed: "10M/10M", price: "$51", duration: "1 Day", color: "bg-emerald-100" },
]


function ClientDashboardContent() {
    return (
        <DashboardLayout>
            {/* ...existing code... */}
        </DashboardLayout>
    );
}

export default function ClientDashboard() {
    return (
        <ClientGuard>
            <ClientDashboardContent />
        </ClientGuard>
    );
}
