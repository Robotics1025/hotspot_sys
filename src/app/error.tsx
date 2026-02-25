"use client"

import { useEffect } from "react"
import Link from "next/link"
import { RefreshCw, Home, AlertTriangle, ArrowLeft, Bug } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Application Error:", error)
    }, [error])

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-6 font-inter">
            <div className="max-w-2xl w-full text-center">
                {/* Error Icon */}
                <div className="mb-8">
                    <div className="relative inline-block">
                        <div className="w-32 h-32 bg-red-100 rounded-4xl flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-16 h-16 text-red-500" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6 mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-outfit">
                        Something Went Wrong
                    </h1>
                    <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
                        We encountered an unexpected error while processing your request. 
                        Don't worry, our team has been notified and is working on a fix.
                    </p>
                    
                    {/* Error Details (for development) */}
                    {process.env.NODE_ENV === 'development' && error.message && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mx-auto max-w-lg">
                            <div className="flex items-start gap-3">
                                <Bug className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <div className="text-left">
                                    <p className="text-sm font-medium text-red-800">Error Details:</p>
                                    <p className="text-sm text-red-700 mt-1 font-mono break-words">
                                        {error.message}
                                    </p>
                                    {error.digest && (
                                        <p className="text-xs text-red-600 mt-2">
                                            Error ID: {error.digest}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                    <button 
                        onClick={reset}
                        className="flex items-center gap-2 px-8 py-4 bg-[#111111] text-white font-bold rounded-2xl hover:bg-orange-500 transition-all shadow-lg shadow-black/10"
                    >
                        <RefreshCw className="w-5 h-5" />
                        <span>Try Again</span>
                    </button>
                    
                    <Link 
                        href="/"
                        className="flex items-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                    >
                        <Home className="w-5 h-5" />
                        <span>Back to Home</span>
                    </Link>
                </div>

                {/* Support Information */}
                <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 font-outfit">Need Help?</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <RefreshCw className="w-6 h-6" />
                            </div>
                            <h3 className="font-medium text-gray-900 mb-2">Try Refreshing</h3>
                            <p className="text-sm text-gray-600">
                                Sometimes a simple refresh can resolve temporary issues.
                            </p>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <ArrowLeft className="w-6 h-6" />
                            </div>
                            <h3 className="font-medium text-gray-900 mb-2">Go Back</h3>
                            <p className="text-sm text-gray-600">
                                Return to the previous page and try a different action.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-500">
                        If this error persists, please contact our support team with the error details above.
                    </p>
                </div>
            </div>
        </div>
    )
}