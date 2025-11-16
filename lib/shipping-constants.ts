/**
 * Shipping related constants
 */

export const DELIVERY_CHARGES = {
    STANDARD: 500,
    EXPRESS: 1000,
    REMOTE_SURCHARGE: 200,
} as const

export const DELIVERY_TIMES = {
    STANDARD_LOCAL: "3-4 business days",
    STANDARD_REMOTE: "5-7 business days",
    EXPRESS_LOCAL: "1-2 business days",
    EXPRESS_REMOTE: "2-3 business days",
} as const

export const SUPPORTED_STATES = ["Gujarat"] as const

export const GUJARAT_PINCODE_PREFIXES = ["3", "4"] as const
