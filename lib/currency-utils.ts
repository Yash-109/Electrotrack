/**
 * Utility function for consistent currency formatting across the application
 * This prevents the "1"s issue caused by toLocaleString()
 */

export function formatCurrency(amount: number | string): string {
    if (!amount || isNaN(Number(amount))) return '₹0.00'

    // Convert to number and ensure it's valid
    const num = parseFloat(amount.toString())
    if (isNaN(num)) return '₹0.00'

    // Format with 2 decimal places
    const formatted = num.toFixed(2)
    const parts = formatted.split('.')

    // Add thousands separator manually
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

    return `₹${parts.join('.')}`
}

/**
 * Format currency without the ₹ symbol (useful for calculations display)
 */
export function formatNumber(amount: number | string): string {
    if (!amount || isNaN(Number(amount))) return '0.00'

    const num = parseFloat(amount.toString())
    if (isNaN(num)) return '0.00'

    const formatted = num.toFixed(2)
    const parts = formatted.split('.')

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

    return parts.join('.')
}

/**
 * Format percentage values
 */
export function formatPercentage(amount: number): string {
    if (!amount || isNaN(amount)) return '0%'
    return `${Math.round(amount)}%`
}
