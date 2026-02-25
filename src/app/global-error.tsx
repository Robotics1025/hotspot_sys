"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, AlertCircle } from "lucide-react"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Global Application Error:", error)
    }, [error])

    return (
        <html>
            <body className="bg-[#F8F9FB] font-inter">
                <div className="min-h-screen flex items-center justify-center p-6">
                    <div className="max-w-lg w-full text-center">
                        {/* Critical Error Icon */}
                        <div className="mb-8">
                            <div className="w-24 h-24 bg-red-100 rounded-4xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                                <AlertTriangle className="w-12 h-12 text-red-500" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-6 mb-8">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                Critical System Error
                            </h1>
                            <p className="text-gray-600 leading-relaxed">
                                We're experiencing a critical system error. Our engineering team 
                                has been automatically notified and is working to resolve this issue.
                            </p>
                            
                            {/* Error ID */}
                            {error.digest && (
                                <div className="bg-gray-100 rounded-xl p-4">
                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>Error ID: {error.digest}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Button */}
                        <div className="mb-8">
                            <button 
                                onClick={reset}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-[#111111] text-white font-bold rounded-2xl hover:bg-red-600 transition-all shadow-lg"
                            >
                                <RefreshCw className="w-5 h-5" />
                                <span>Reload Application</span>
                            </button>
                        </div>

                        {/* Support Message */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <p className="text-sm text-gray-600">
                                If this error continues, please refresh your browser or try again later. 
                                For urgent issues, contact our support team.
                            </p>
                        </div>
                        
                        {/* Footer */}
                        <div className="mt-8 text-center">
                            <p className="text-xs text-gray-500">
                                FastNet Hotspot Management System
                            </p>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    )
}