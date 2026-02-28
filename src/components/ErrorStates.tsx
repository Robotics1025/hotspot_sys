"use client"

import { AlertTriangle, RefreshCw, XCircle, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface ErrorDisplayProps {
    error: string | null
    onRetry?: () => void
    className?: string
    variant?: "error" | "warning" | "info"
    size?: "sm" | "md" | "lg"
}

export function ErrorDisplay({ 
    error, 
    onRetry, 
    className,
    variant = "error",
    size = "md"
}: ErrorDisplayProps) {
    if (!error) return null

    const variants = {
        error: {
            container: "bg-red-50 border-red-200 text-red-800",
            icon: XCircle,
            iconColor: "text-red-500"
        },
        warning: {
            container: "bg-yellow-50 border-yellow-200 text-yellow-800", 
            icon: AlertTriangle,
            iconColor: "text-yellow-500"
        },
        info: {
            container: "bg-blue-50 border-blue-200 text-blue-800",
            icon: Info,
            iconColor: "text-blue-500"
        }
    }

    const sizes = {
        sm: {
            container: "p-4 text-sm",
            icon: "w-4 h-4",
            button: "px-3 py-1.5 text-xs"
        },
        md: {
            container: "p-6 text-sm",
            icon: "w-5 h-5", 
            button: "px-4 py-2 text-sm"
        },
        lg: {
            container: "p-8 text-base",
            icon: "w-6 h-6",
            button: "px-6 py-3 text-base"
        }
    }

    const variantConfig = variants[variant]
    const sizeConfig = sizes[size]
    const Icon = variantConfig.icon

    return (
        <div className={cn(
            "border rounded-2xl flex items-start gap-3",
            variantConfig.container,
            sizeConfig.container,
            className
        )}>
            <Icon className={cn(sizeConfig.icon, variantConfig.iconColor, "flex-shrink-0 mt-0.5")} />
            <div className="flex-1">
                <p className="font-medium">{error}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className={cn(
                            "mt-3 inline-flex items-center gap-2 bg-white border border-current rounded-lg font-medium hover:bg-gray-50 transition-colors",
                            sizeConfig.button
                        )}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                )}
            </div>
        </div>
    )
}

interface EmptyStateProps {
    title: string
    description?: string
    action?: {
        label: string
        onClick: () => void
    }
    icon?: React.ComponentType<{ className?: string }>
    className?: string
}

export function EmptyState({
    title,
    description,
    action,
    icon: Icon = AlertCircle,
    className
}: EmptyStateProps) {
    return (
        <div className={cn("text-center py-12", className)}>
            <div className="w-16 h-16 bg-gray-100 rounded-4xl flex items-center justify-center mx-auto mb-6">
                <Icon className="w-8 h-8 text-gray-400" />
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2 font-outfit">{title}</h3>
            
            {description && (
                <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                    {description}
                </p>
            )}
            
            {action && (
                <button
                    onClick={action.onClick}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#111111] text-white font-bold rounded-2xl hover:bg-orange-500 transition-all shadow-lg shadow-black/10"
                >
                    {action.label}
                </button>
            )}
        </div>
    )
}

interface NetworkErrorProps {
    onRetry?: () => void
    className?: string
}

export function NetworkError({ onRetry, className }: NetworkErrorProps) {
    return (
        <ErrorDisplay
            error="Unable to connect to the server. Please check your internet connection and try again."
            onRetry={onRetry}
            variant="error"
            className={className}
        />
    )
}

interface UnauthorizedErrorProps {
    onRetry?: () => void
    className?: string
}

export function UnauthorizedError({ onRetry, className }: UnauthorizedErrorProps) {
    return (
        <ErrorDisplay
            error="Your session has expired. Please log in again to continue."
            onRetry={onRetry}
            variant="warning"
            className={className}
        />
    )
}