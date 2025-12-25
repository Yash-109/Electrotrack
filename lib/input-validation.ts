/**
 * Comprehensive Input Validation and Sanitization Utilities
 * Provides centralized validation logic with security and UX enhancements
 */

import { log } from './logger'

export interface ValidationResult {
    isValid: boolean
    error?: string
    sanitized: string
}

export interface ValidationOptions {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    customValidator?: (value: string) => boolean
    errorMessage?: string
}

/**
 * Enhanced sanitization with XSS and injection protection
 */
export class InputValidator {
    // Sanitize HTML entities to prevent XSS attacks
    static sanitizeHTML(input: string): string {
        if (!input) return ''

        const htmlEntities: Record<string, string> = {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '&': '&amp;',
            '/': '&#x2F;'
        }

        return input.replace(/[<>"'&\/]/g, char => htmlEntities[char] || char)
    }

    // Remove dangerous SQL characters
    static sanitizeSQL(input: string): string {
        if (!input) return ''
        return input.replace(/['";\\]/g, '').trim()
    }

    // Sanitize name fields (letters, spaces, hyphens only)
    static sanitizeName(input: string): string {
        if (!input) return ''
        return input.replace(/[^a-zA-Z\s-]/g, '').trim()
    }

    // Sanitize phone numbers (digits only)
    static sanitizePhone(input: string): string {
        if (!input) return ''
        return input.replace(/\D/g, '').trim()
    }

    // Sanitize email (remove spaces and convert to lowercase)
    static sanitizeEmail(input: string): string {
        if (!input) return ''
        return input.replace(/\s/g, '').toLowerCase().trim()
    }

    // Sanitize address (remove script tags and dangerous content)
    static sanitizeAddress(input: string): string {
        if (!input) return ''

        let sanitized = input.trim()
        // Remove script tags
        sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Remove common XSS patterns
        sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        // Keep common address characters
        sanitized = sanitized.replace(/[^a-zA-Z0-9\s,.\-#/()]/g, '')

        return sanitized
    }

    // Validate email format
    static validateEmail(email: string): ValidationResult {
        const sanitized = this.sanitizeEmail(email)

        if (!sanitized) {
            return { isValid: false, error: 'Email is required', sanitized }
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

        if (!emailRegex.test(sanitized)) {
            return { isValid: false, error: 'Please enter a valid email address', sanitized }
        }

        return { isValid: true, sanitized }
    }

    // Validate Indian phone number
    static validatePhone(phone: string): ValidationResult {
        const sanitized = this.sanitizePhone(phone)

        if (!sanitized) {
            return { isValid: false, error: 'Phone number is required', sanitized }
        }

        if (sanitized.length !== 10) {
            return { isValid: false, error: 'Phone number must be 10 digits', sanitized }
        }

        if (!['6', '7', '8', '9'].includes(sanitized[0])) {
            return { isValid: false, error: 'Please enter a valid Indian phone number', sanitized }
        }

        return { isValid: true, sanitized }
    }

    // Validate name (letters, spaces, hyphens)
    static validateName(name: string, minLength: number = 2): ValidationResult {
        const sanitized = this.sanitizeName(name)

        if (!sanitized) {
            return { isValid: false, error: 'Name is required', sanitized }
        }

        if (sanitized.length < minLength) {
            return { isValid: false, error: `Name must be at least ${minLength} characters`, sanitized }
        }

        if (sanitized.length > 100) {
            return { isValid: false, error: 'Name is too long (max 100 characters)', sanitized }
        }

        if (!/^[a-zA-Z\s-]+$/.test(sanitized)) {
            return { isValid: false, error: 'Name can only contain letters, spaces, and hyphens', sanitized }
        }

        return { isValid: true, sanitized }
    }

    // Validate Indian PIN code
    static validatePincode(pincode: string): ValidationResult {
        const sanitized = pincode.replace(/\D/g, '').trim()

        if (!sanitized) {
            return { isValid: false, error: 'PIN code is required', sanitized }
        }

        if (sanitized.length !== 6) {
            return { isValid: false, error: 'PIN code must be 6 digits', sanitized }
        }

        if (sanitized[0] === '0') {
            return { isValid: false, error: 'Invalid PIN code', sanitized }
        }

        return { isValid: true, sanitized }
    }

    // Validate address
    static validateAddress(address: string): ValidationResult {
        const sanitized = this.sanitizeAddress(address)

        if (!sanitized) {
            return { isValid: false, error: 'Address is required', sanitized }
        }

        if (sanitized.length < 10) {
            return { isValid: false, error: 'Please provide a complete address (minimum 10 characters)', sanitized }
        }

        if (sanitized.length > 200) {
            return { isValid: false, error: 'Address is too long (max 200 characters)', sanitized }
        }

        return { isValid: true, sanitized }
    }

    // Validate city name
    static validateCity(city: string): ValidationResult {
        const sanitized = this.sanitizeName(city)

        if (!sanitized) {
            return { isValid: false, error: 'City is required', sanitized }
        }

        if (sanitized.length < 2) {
            return { isValid: false, error: 'City name must be at least 2 characters', sanitized }
        }

        if (!/^[a-zA-Z\s]+$/.test(sanitized)) {
            return { isValid: false, error: 'City name can only contain letters', sanitized }
        }

        return { isValid: true, sanitized }
    }

    // Generic validator with custom options
    static validate(input: string, options: ValidationOptions): ValidationResult {
        let sanitized = input?.trim() || ''

        // Check required
        if (options.required && !sanitized) {
            return {
                isValid: false,
                error: options.errorMessage || 'This field is required',
                sanitized
            }
        }

        // Check min length
        if (options.minLength && sanitized.length < options.minLength) {
            return {
                isValid: false,
                error: options.errorMessage || `Minimum ${options.minLength} characters required`,
                sanitized
            }
        }

        // Check max length
        if (options.maxLength && sanitized.length > options.maxLength) {
            return {
                isValid: false,
                error: options.errorMessage || `Maximum ${options.maxLength} characters allowed`,
                sanitized
            }
        }

        // Check pattern
        if (options.pattern && !options.pattern.test(sanitized)) {
            return {
                isValid: false,
                error: options.errorMessage || 'Invalid format',
                sanitized
            }
        }

        // Custom validator
        if (options.customValidator && !options.customValidator(sanitized)) {
            return {
                isValid: false,
                error: options.errorMessage || 'Validation failed',
                sanitized
            }
        }

        return { isValid: true, sanitized }
    }

    // Batch validate multiple fields
    static validateMultiple(fields: Record<string, { value: string; options: ValidationOptions }>): {
        isValid: boolean
        errors: Record<string, string>
        sanitized: Record<string, string>
    } {
        const errors: Record<string, string> = {}
        const sanitized: Record<string, string> = {}

        for (const [fieldName, { value, options }] of Object.entries(fields)) {
            const result = this.validate(value, options)
            sanitized[fieldName] = result.sanitized

            if (!result.isValid) {
                errors[fieldName] = result.error || 'Invalid input'
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
            sanitized
        }
    }

    // Log validation attempts for security monitoring
    static logValidationFailure(field: string, value: string, error: string): void {
        log.warn(`Validation failed for ${field}`, {
            field,
            error,
            valueLength: value?.length || 0,
            timestamp: new Date().toISOString()
        }, 'InputValidator')
    }
}

// Export convenience functions
export const {
    sanitizeHTML,
    sanitizeSQL,
    sanitizeName,
    sanitizePhone,
    sanitizeEmail,
    sanitizeAddress,
    validateEmail,
    validatePhone,
    validateName,
    validatePincode,
    validateAddress,
    validateCity,
    validate,
    validateMultiple,
    logValidationFailure
} = InputValidator
