import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-[#F8F9FB] font-inter overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <TopBar />
                <main className="flex-1 overflow-auto p-8 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    )
}
