/**
 * Enhanced styling utilities for admin dashboard components
 */

export const adminTheme = {
    colors: {
        primary: "rgb(59, 130, 246)", // blue-500
        secondary: "rgb(99, 102, 241)", // indigo-500
        success: "rgb(34, 197, 94)", // green-500
        warning: "rgb(251, 191, 36)", // amber-400
        danger: "rgb(239, 68, 68)", // red-500
        muted: "rgb(107, 114, 128)", // gray-500
    },
    gradients: {
        primary: "bg-gradient-to-br from-blue-500 to-blue-600",
        secondary: "bg-gradient-to-br from-indigo-500 to-indigo-600",
        success: "bg-gradient-to-br from-green-500 to-green-600",
        warning: "bg-gradient-to-br from-amber-400 to-amber-500",
        danger: "bg-gradient-to-br from-red-500 to-red-600",
    },
    shadows: {
        card: "shadow-lg shadow-gray-200/50",
        hover: "shadow-xl shadow-gray-300/50",
        glow: "shadow-2xl shadow-blue-500/20",
    }
} as const

export const getStatCardStyles = (type: 'revenue' | 'expense' | 'profit' | 'activity') => {
    const baseClasses = "relative overflow-hidden transition-all duration-300 hover:scale-105"

    switch (type) {
        case 'revenue':
            return `${baseClasses} bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-xl hover:shadow-green-100/50`
        case 'expense':
            return `${baseClasses} bg-gradient-to-br from-red-50 to-rose-50 border-red-200 hover:shadow-xl hover:shadow-red-100/50`
        case 'profit':
            return `${baseClasses} bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-xl hover:shadow-blue-100/50`
        case 'activity':
            return `${baseClasses} bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-xl hover:shadow-purple-100/50`
        default:
            return baseClasses
    }
}

export const getIconStyles = (type: 'revenue' | 'expense' | 'profit' | 'activity') => {
    const baseClasses = "h-6 w-6"

    switch (type) {
        case 'revenue':
            return `${baseClasses} text-green-600`
        case 'expense':
            return `${baseClasses} text-red-600`
        case 'profit':
            return `${baseClasses} text-blue-600`
        case 'activity':
            return `${baseClasses} text-purple-600`
        default:
            return baseClasses
    }
}

export const getChangeIndicatorStyles = (changeType: 'positive' | 'negative' | 'neutral') => {
    switch (changeType) {
        case 'positive':
            return "text-green-600 bg-green-100"
        case 'negative':
            return "text-red-600 bg-red-100"
        case 'neutral':
            return "text-gray-600 bg-gray-100"
        default:
            return "text-gray-600 bg-gray-100"
    }
}
