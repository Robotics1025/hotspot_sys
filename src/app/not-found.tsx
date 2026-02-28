"use client"

import Link from "next/link"
import { Home, ArrowLeft, Search, HelpCircle } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-6 font-inter">
            <div className="max-w-2xl w-full text-center">
                {/* Error Illustration */}
                <div className="mb-8">
                    <div className="relative inline-block">
                        <div className="text-[120px] font-black text-gray-200 leading-none">404</div>
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent text-[120px] font-black leading-none opacity-80">
                            404
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6 mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-outfit">
                        Oops! Page Not Found
                    </h1>
                    <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                        The page you're looking for seems to have vanished into the digital void. 
                        Let's get you back on track.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                    <Link 
                        href="/" 
                        className="flex items-center gap-2 px-8 py-4 bg-[#111111] text-white font-bold rounded-2xl hover:bg-orange-500 transition-all shadow-lg shadow-black/10 group"
                    >
                        <Home className="w-5 h-5" />
                        <span>Back to Home</span>
                    </Link>
                    
                    <button 
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Go Back</span>
                    </button>
                </div>

                {/* Quick Links */}
                <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 font-outfit">Maybe you were looking for:</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Link 
                            href="/admin" 
                            className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-orange-50 hover:border-orange-200 border border-transparent transition-all group"
                        >
                            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all">
                                <Home className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-gray-900">Admin Dashboard</p>
                                <p className="text-sm text-gray-500">Manage your platform</p>
                            </div>
                        </Link>
                        
                        <Link 
                            href="/client" 
                            className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all group"
                        >
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                                <Search className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-gray-900">Client Portal</p>
                                <p className="text-sm text-gray-500">Access your account</p>
                            </div>
                        </Link>
                        
                        <Link 
                            href="/login" 
                            className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-purple-50 hover:border-purple-200 border border-transparent transition-all group"
                        >
                            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all">
                                <HelpCircle className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-gray-900">Get Connected</p>
                                <p className="text-sm text-gray-500">Access hotspot login</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-500">
                        If you believe this is an error, please contact our support team.
                    </p>
                </div>
            </div>
        </div>
    )
}