import DashboardLayout from "@/components/DashboardLayout"
import { Users, User, Ticket, AlertCircle, Play, MoreHorizontal, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

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

export default function ClientDashboard() {
    return (
        <DashboardLayout>
            <div className="flex flex-col gap-10">
                {/* Welcome Header */}
                <div className="relative h-64 bg-[#111111] rounded-4xl overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10" />
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-[url('https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700" />

                    <div className="relative z-20 h-full flex flex-col justify-center px-12">
                        <h1 className="text-4xl font-bold text-white mb-4 font-outfit">Welcome back, Joel!</h1>
                        <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
                            Manage your hotspot network and track your business performance in real-time.
                        </p>
                        <button className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-2xl hover:bg-orange-500 hover:text-white transition-all w-fit">
                            <Play className="w-4 h-4 fill-current" />
                            <span>Learn more</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Main Content Area */}
                    <div className="col-span-8 flex flex-col gap-10">
                        {/* Analytics Section */}
                        <div>
                            <div className="flex items-end justify-between mb-6">
                                <h2 className="text-xl font-bold font-outfit">Analytic</h2>
                                <button className="text-sm font-semibold text-gray-500 hover:text-orange-500">See more</button>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                {stats.map((stat) => (
                                    <div key={stat.name} className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-orange-200 transition-all hover:shadow-lg hover:shadow-orange-500/5 group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={cn("p-3 rounded-2xl text-white", stat.color)}>
                                                <stat.icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                                                <ArrowUpRight className="w-3 h-3" />
                                                {stat.change}
                                            </div>
                                        </div>
                                        <p className="text-xs font-semibold text-gray-400 mb-1">{stat.name}</p>
                                        <h3 className="text-2xl font-bold text-gray-900 font-outfit">{stat.value}</h3>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Popular Plans Section */}
                        <div>
                            <div className="flex items-end justify-between mb-6">
                                <h2 className="text-xl font-bold font-outfit">Active Plans</h2>
                                <button className="text-sm font-semibold text-gray-500 hover:text-orange-500">See more</button>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                {popularPlans.map((plan) => (
                                    <div key={plan.name} className="bg-white p-4 rounded-4xl border border-gray-100 hover:border-orange-200 transition-all group overflow-hidden">
                                        <div className={cn("relative h-48 rounded-3xl mb-4 overflow-hidden", plan.color)}>
                                            <div className="absolute inset-0 flex items-center justify-center opacity-20 transform -rotate-12">
                                                <Ticket className="w-32 h-32" />
                                            </div>
                                            <div className="absolute top-4 right-4 p-2 bg-white/50 backdrop-blur rounded-xl">
                                                <Ticket className="w-4 h-4 text-gray-900" />
                                            </div>
                                        </div>
                                        <div className="px-2">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-gray-900">{plan.name}</h3>
                                                <span className="text-lg font-bold text-orange-500">{plan.price}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                                                <span>{plan.duration}</span>
                                                <span className="px-2 py-1 bg-gray-50 rounded-md border border-gray-100">{plan.speed}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Recent Activity */}
                    <div className="col-span-4 flex flex-col gap-10">
                        <div className="bg-white p-8 rounded-4xl border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold font-outfit">Recent Sales</h2>
                                <MoreHorizontal className="w-5 h-5 text-gray-400" />
                            </div>

                            <div className="space-y-6">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                                            <User className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-gray-900">{activity.user}</h4>
                                            <p className="text-[10px] text-gray-500 font-medium">{activity.plan}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-gray-900">{activity.price}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-50 space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium">Service Fee (15%)</span>
                                    <span className="text-gray-900 font-bold">$1.00</span>
                                </div>
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span className="text-gray-900">Total Payout</span>
                                    <span className="text-orange-500">$1231.00</span>
                                </div>
                                <button className="w-full py-4 bg-orange-400 text-white font-bold rounded-2xl hover:bg-orange-500 transition-all flex items-center justify-center gap-2">
                                    <Ticket className="w-5 h-5" />
                                    Generate Report
                                </button>
                            </div>
                        </div>

                        {/* Address / Router Card */}
                        <div className="bg-white p-8 rounded-[32px] border border-gray-100">
                            <h2 className="text-lg font-bold font-outfit mb-4">Site Location</h2>
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-5 h-5 mt-1 text-orange-500">
                                    <AlertCircle className="w-full h-full" />
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                    Main Cafe, Plot 42, St. Sraties, Entebbe.
                                </p>
                            </div>
                            <div className="h-40 bg-gray-100 rounded-3xl overflow-hidden bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center">
                                <div className="w-full h-full bg-black/20 hover:bg-black/0 transition-all cursor-pointer" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
