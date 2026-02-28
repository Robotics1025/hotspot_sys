"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { ClientGuard } from "@/components/ClientGuard"
import {
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
    Type, Image as ImageIcon, Palette, Save, ChevronDown,
    RotateCcw, RotateCw, ZoomIn, ZoomOut, FileText, Search, Wifi
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

function SiteEditorContent() {
    const [activeTab, setActiveTab] = useState("home")

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-120px)] flex flex-col bg-[#F3F3F3] rounded-[32px] overflow-hidden border border-gray-200">

                {/* ribbon header (word style) */}
                <div className="bg-white border-b border-gray-200 flex flex-col shadow-sm">
                    {/* window bar */}
                    <div className="flex items-center px-4 py-1.5 gap-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                                <FileText className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs font-bold text-gray-700">FastNet_Landing_Page.docx - FastNet Site Editor</span>
                        </div>
                        <div className="flex-1 flex justify-center">
                            <div className="bg-gray-100 rounded-lg px-3 py-1 flex items-center gap-2 w-96">
                                <Search className="w-3 h-3 text-gray-400" />
                                <input type="text" placeholder="Search for features..." className="bg-transparent border-none outline-none text-[10px] w-full" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded hover:bg-blue-700 transition-all">Share</button>
                        </div>
                    </div>

                    {/* tab bar */}
                    <div className="flex px-8 border-b border-gray-100">
                        {["File", "Home", "Insert", "Design", "Layout", "Review", "View"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase())}
                                className={cn(
                                    "px-4 py-2 text-xs font-medium transition-all relative border-b-2",
                                    activeTab === tab.toLowerCase() ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:bg-gray-50"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* toolbar ribbon */}
                    <div className="flex items-center p-2 gap-8 bg-gray-50/50">
                        {/* Clipboard */}
                        <div className="flex gap-1 border-r border-gray-200 pr-4">
                            <div className="flex flex-col items-center p-1 hover:bg-gray-100 rounded cursor-pointer min-w-[40px]">
                                <Save className="w-5 h-5 text-gray-600" />
                                <span className="text-[8px] mt-1 font-medium">Save</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="p-1 hover:bg-gray-100 rounded cursor-pointer">
                                    <RotateCcw className="w-4 h-4 text-gray-600" />
                                </div>
                                <div className="p-1 hover:bg-gray-100 rounded cursor-pointer">
                                    <RotateCw className="w-4 h-4 text-gray-600" />
                                </div>
                            </div>
                        </div>

                        {/* Font */}
                        <div className="flex gap-2 border-r border-gray-200 pr-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-1">
                                    <div className="bg-white border border-gray-300 rounded px-2 py-0.5 flex items-center gap-4 cursor-pointer">
                                        <span className="text-[10px] font-medium min-w-[80px]">Inter</span>
                                        <ChevronDown className="w-3 h-3 text-gray-400" />
                                    </div>
                                    <div className="bg-white border border-gray-300 rounded px-2 py-0.5 flex items-center gap-2 cursor-pointer">
                                        <span className="text-[10px] font-medium">12</span>
                                        <ChevronDown className="w-3 h-3 text-gray-400" />
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button className="p-1.5 hover:bg-gray-200 rounded text-gray-700"><Bold className="w-3.5 h-3.5" /></button>
                                    <button className="p-1.5 hover:bg-gray-200 rounded text-gray-700"><Italic className="w-3.5 h-3.5" /></button>
                                    <button className="p-1.5 hover:bg-gray-200 rounded text-gray-700 border-b-2 border-orange-500"><Underline className="w-3.5 h-3.5" /></button>
                                    <div className="w-px h-full bg-gray-200 mx-1" />
                                    <div className="p-1.5 hover:bg-gray-200 rounded text-blue-600"><Type className="w-3.5 h-3.5" /></div>
                                </div>
                            </div>
                        </div>

                        {/* Paragraph */}
                        <div className="flex flex-col gap-2 border-r border-gray-200 pr-4">
                            <div className="flex gap-1">
                                <button className="p-1.5 hover:bg-gray-200 rounded text-gray-700 bg-gray-200"><AlignLeft className="w-3.5 h-3.5" /></button>
                                <button className="p-1.5 hover:bg-gray-200 rounded text-gray-700"><AlignCenter className="w-3.5 h-3.5" /></button>
                                <button className="p-1.5 hover:bg-gray-200 rounded text-gray-700"><AlignRight className="w-3.5 h-3.5" /></button>
                            </div>
                            <div className="flex gap-1 justify-center">
                                <div className="p-1 hover:bg-gray-200 rounded cursor-pointer min-w-[60px] flex items-center justify-center gap-1 border border-transparent hover:border-gray-300">
                                    <Palette className="w-3 h-3 text-orange-500" />
                                    <span className="text-[9px] font-bold">Theme</span>
                                </div>
                            </div>
                        </div>

                        {/* Insert */}
                        <div className="flex flex-col items-center gap-1 p-1 hover:bg-gray-100 rounded cursor-pointer group min-w-[60px]">
                            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform text-orange-600">
                                <ImageIcon className="w-6 h-6" />
                            </div>
                            <span className="text-[9px] font-bold text-gray-600">Pictures</span>
                        </div>

                        <div className="ml-auto pr-8 flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1">
                                <ZoomOut className="w-3 h-3 text-gray-400 cursor-pointer" />
                                <span className="text-[10px] font-bold text-gray-600">100%</span>
                                <ZoomIn className="w-3 h-3 text-gray-400 cursor-pointer" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* editor workspace */}
                <div className="flex-1 overflow-auto custom-scrollbar flex justify-center p-12 bg-[#F3F3F3]">
                    {/* the "A4" page */}
                    <div className="w-[800px] bg-white shadow-2xl min-h-[1131px] p-[80px] relative">
                        {/* Branding Mockup inside the "page" */}
                        <div className="border-[0.5px] border-gray-100 p-8 min-h-[900px]">
                            <div className="flex flex-col items-center mb-12">
                                <div className="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center mb-6">
                                    <Wifi className="w-10 h-10 text-white" />
                                </div>
                                <h1 className="text-4xl font-bold font-outfit text-center mb-4">Wecome to Our Site!</h1>
                                <p className="text-gray-400 text-center max-w-sm">Enjoy high-speed guest WiFi during your stay. Please select a plan below to get started.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-12">
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 text-center">
                                    <h3 className="font-bold mb-1">Standard Pass</h3>
                                    <p className="text-[10px] text-gray-400 mb-4">2Mbps Speed</p>
                                    <span className="text-xl font-bold text-orange-500">$51.00</span>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 text-center">
                                    <h3 className="font-bold mb-1">Premium Pass</h3>
                                    <p className="text-[10px] text-gray-400 mb-4">10Mbps Speed</p>
                                    <span className="text-xl font-bold text-orange-500">$121.00</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="h-12 bg-gray-100 rounded-2xl animate-pulse" />
                                <div className="h-12 bg-[#111111] rounded-2xl flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">Connect Now</span>
                                </div>
                            </div>

                            {/* cursor simulator */}
                            <div className="absolute top-[300px] left-[450px]">
                                <div className="w-px h-8 bg-blue-600 animate-pulse" />
                            </div>
                        </div>

                        {/* footer page info */}
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center opacity-20 pointer-events-none">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[10px]">Page 1 of 1</span>
                        </div>
                    </div>
                </div>

                {/* status bar */}
                <div className="bg-white border-t border-gray-200 px-6 py-1.5 flex items-center justify-between text-[10px] text-gray-500 font-medium">
                    <div className="flex items-center gap-6">
                        <span>Page 1 of 1</span>
                        <span>84 words</span>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-blue-600 rounded-sm" />
                            <span>English (United States)</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <FileText className="w-3 h-3" />
                            <span>Accessibility: Good to go</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>Focus</span>
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="w-2/3 h-full bg-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default function SiteEditor() {
    return (
        <ClientGuard>
            <SiteEditorContent />
        </ClientGuard>
    )
}
