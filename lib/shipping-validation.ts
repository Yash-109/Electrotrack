/**
 * Shipping and address validation utilities
 * Provides comprehensive validation for shipping forms and addresses
 */

export interface ShippingFormData {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
    deliveryMethod: string
    paymentMethod: string
}

export interface ValidationResult {
    isValid: boolean
    errors: Record<string, string>
}

/**
 * Validates a complete shipping form
 */
export function validateShippingForm(data: ShippingFormData): ValidationResult {
    const errors: Record<string, string> = {}

    // Full name validation
    if (!data.fullName.trim()) {
        errors.fullName = "Full name is required"
    } else if (data.fullName.trim().length < 2) {
        errors.fullName = "Full name must be at least 2 characters"
    } else if (!/^[a-zA-Z\s]+$/.test(data.fullName.trim())) {
        errors.fullName = "Full name can only contain letters and spaces"
    }

    // Email validation
    if (!data.email.trim()) {
        errors.email = "Email is required"
    } else if (!isValidEmail(data.email)) {
        errors.email = "Please enter a valid email address"
    }

    // Phone validation
    if (!data.phone.trim()) {
        errors.phone = "Phone number is required"
    } else if (!isValidIndianPhoneNumber(data.phone)) {
        errors.phone = "Please enter a valid Indian phone number"
    }

    // Address validation
    if (!data.address.trim()) {
        errors.address = "Address is required"
    } else if (data.address.trim().length < 10) {
        errors.address = "Please provide a complete address (minimum 10 characters)"
    }

    // City validation
    if (!data.city.trim()) {
        errors.city = "City is required"
    } else if (data.city.trim().length < 2) {
        errors.city = "City name must be at least 2 characters"
    } else if (!/^[a-zA-Z\s]+$/.test(data.city.trim())) {
        errors.city = "City name can only contain letters and spaces"
    }

    // Pincode validation
    if (!data.pincode.trim()) {
        errors.pincode = "Pincode is required"
    } else if (!isValidIndianPincode(data.pincode)) {
        errors.pincode = "Please enter a valid 6-digit pincode"
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
}

/**
 * Validates Indian phone numbers
 * Supports formats: +91XXXXXXXXXX, 91XXXXXXXXXX, XXXXXXXXXX
 */
export function isValidIndianPhoneNumber(phone: string): boolean {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')

    // Check for valid Indian phone number patterns
    if (cleaned.length === 10) {
        // 10-digit number (without country code)
        return /^[6-9]\d{9}$/.test(cleaned)
    } else if (cleaned.length === 12) {
        // 12-digit number with country code (91)
        return /^91[6-9]\d{9}$/.test(cleaned)
    }

    return false
}

/**
 * Validates Indian pincode
 */
export function isValidIndianPincode(pincode: string): boolean {
    // Remove all non-digit characters
    const cleaned = pincode.replace(/\D/g, '')

    // Indian pincodes are 6 digits and don't start with 0
    return /^[1-9]\d{5}$/.test(cleaned)
}

/**
 * Formats phone number for display
 */
export function formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '')

    if (cleaned.length === 10) {
        return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
        const number = cleaned.slice(2)
        return `+91 ${number.slice(0, 5)} ${number.slice(5)}`
    }

    return phone
}

/**
 * Formats pincode for display
 */
export function formatPincode(pincode: string): string {
    const cleaned = pincode.replace(/\D/g, '')
    return cleaned.slice(0, 6)
}

/**
 * Validates if delivery is available for the given pincode
 * Currently supports all Gujarat pincodes (3xxxxx and 4xxxxx)
 */
export function isDeliveryAvailable(pincode: string): { available: boolean; message?: string } {
    const cleaned = pincode.replace(/\D/g, '')

    if (!isValidIndianPincode(cleaned)) {
        return { available: false, message: "Invalid pincode format" }
    }

    // Check Gujarat pincodes (starting with 3 or 4)
    const firstDigit = cleaned.charAt(0)
    if (firstDigit === '3' || firstDigit === '4') {
        return { available: true }
    }

    return {
        available: false,
        message: "Currently we only deliver within Gujarat. Delivery to other states will be available soon."
    }
}

/**
 * Calculates delivery charges based on pincode and delivery method
 */
export function calculateDeliveryCharges(pincode: string, deliveryMethod: 'standard' | 'express'): number {
    const cleaned = pincode.replace(/\D/g, '')

    if (!isDeliveryAvailable(cleaned).available) {
        return 0 // No delivery available
    }

    // Base charges for Gujarat
    const baseStandardCharge = 500
    const baseExpressCharge = 1000

    // Additional charges for remote areas (4xxxxx pincodes)
    const isRemoteArea = cleaned.charAt(0) === '4'
    const remoteAreaSurcharge = isRemoteArea ? 200 : 0

    if (deliveryMethod === 'express') {
        return baseExpressCharge + remoteAreaSurcharge
    }

    return baseStandardCharge + remoteAreaSurcharge
}

/**
 * Estimates delivery time based on pincode and delivery method
 */
export function estimateDeliveryTime(pincode: string, deliveryMethod: 'standard' | 'express'): string {
    const cleaned = pincode.replace(/\D/g, '')

    if (!isDeliveryAvailable(cleaned).available) {
        return "Delivery not available"
    }

    // Check if it's Surat area (395xxx)
    const isSuratArea = cleaned.startsWith('395')

    if (deliveryMethod === 'express') {
        return isSuratArea ? "1-2 business days" : "2-3 business days"
    }

    return isSuratArea ? "3-4 business days" : "5-7 business days"
}
