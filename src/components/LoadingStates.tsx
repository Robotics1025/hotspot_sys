import { RefreshCw, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg"
    className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-6 h-6", 
        lg: "w-8 h-8"
    }

    return (
        <RefreshCw className={cn("animate-spin text-gray-400", sizeClasses[size], className)} />
    )
}

interface LoadingStateProps {
    message?: string
    size?: "sm" | "md" | "lg"
    fullScreen?: boolean
    className?: string
}

export function LoadingState({ 
    message = "Loading...", 
    size = "md", 
    fullScreen = false,
    className 
}: LoadingStateProps) {
    const containerClasses = fullScreen 
        ? "fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
        : "flex items-center justify-center py-12"

    return (
        <div className={cn(containerClasses, className)}>
            <div className="flex items-center gap-3">
                <LoadingSpinner size={size} />
                <span className="text-gray-500 font-medium">{message}</span>
            </div>
        </div>
    )
}

interface SkeletonProps {
    className?: string
    count?: number
}

export function Skeleton({ className, count = 1 }: SkeletonProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "animate-pulse bg-gray-200 rounded-lg",
                        className
                    )}
                />
            ))}
        </>
    )
}

// Table skeleton for data tables  
export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-6">
                    {Array.from({ length: columns }).map((_, j) => (
                        <Skeleton 
                            key={j} 
                            className={cn(
                                "h-4",
                                j === 0 ? "w-24" : j === columns - 1 ? "w-16" : "w-32"
                            )}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}

// Card skeleton for dashboard cards
export function CardSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton className="w-12 h-12 rounded-4xl" />
                        <Skeleton className="w-16 h-6 rounded-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="w-24 h-8" />
                        <Skeleton className="w-32 h-4" />
                    </div>
                </div>
            ))}
        </div>
    )
}

// List item skeleton
export function ListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="w-48 h-4" />
                        <Skeleton className="w-32 h-3" />
                    </div>
                    <Skeleton className="w-20 h-6 rounded-full" />
                </div>
            ))}
        </div>
    )
}