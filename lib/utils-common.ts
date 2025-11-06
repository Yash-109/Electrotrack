// Common utilities for the application

// Format timestamps for consistent logging
export function formatTimestamp(date = new Date()): string {
    return date.toISOString().replace('T', ' ').substring(0, 19)
}

// Generate unique request IDs for tracking
export function generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
}

// Validate email format
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// Sanitize user input to prevent XSS
export function sanitizeInput(input: string): string {
    return input
        .replace(/[<>'"&]/g, (match) => {
            const map: { [key: string]: string } = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '&': '&amp;'
            }
            return map[match] || match
        })
        .trim()
}

// Format file sizes for display
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Sleep utility for delays
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// Generate random string for tokens
export function generateRandomString(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

// Format currency for display
export function formatCurrency(amount: number, currency = 'INR'): string {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return '₹0'
    }

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount).replace(/INR/, '₹')
}

// Safe string truncation
export function truncateText(text: string, maxLength: number): string {
    if (!text || typeof text !== 'string') return ''
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength - 3) + '...'
}
