import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg"
    text?: string
    className?: string
    variant?: "default" | "overlay" | "inline"
}

export function LoadingSpinner({
    size = "md",
    text,
    className,
    variant = "default"
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12"
    }

    const textClasses = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg"
    }

    if (variant === "overlay") {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
                    <Loader2 className={cn(sizeClasses[size], "animate-spin text-blue-600")} />
                    {text && (
                        <p className={cn(textClasses[size], "text-gray-700 font-medium")}>
                            {text}
                        </p>
                    )}
                </div>
            </div>
        )
    }

    if (variant === "inline") {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                <Loader2 className={cn(sizeClasses[size], "animate-spin text-blue-600")} />
                {text && (
                    <span className={cn(textClasses[size], "text-gray-600")}>
                        {text}
                    </span>
                )}
            </div>
        )
    }

    return (
        <div className={cn("flex flex-col items-center justify-center gap-3 py-8", className)}>
            <Loader2 className={cn(sizeClasses[size], "animate-spin text-blue-600")} />
            {text && (
                <p className={cn(textClasses[size], "text-gray-600 font-medium")}>
                    {text}
                </p>
            )}
        </div>
    )
}
