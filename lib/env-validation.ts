// Environment validation utility
const requiredEnvVars = [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
] as const

const optionalEnvVars = [
    'MONGODB_DB',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'ADMIN_USERNAME_1',
    'ADMIN_PASSWORD_1'
] as const

export function validateEnvironment(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check required environment variables
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            errors.push(`Missing required environment variable: ${envVar}`)
        }
    }

    // Validate MONGODB_URI format
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.startsWith('mongodb')) {
        errors.push('MONGODB_URI must be a valid MongoDB connection string')
    }

    // Validate admin credentials if provided
    if (process.env.ADMIN_USERNAME_1 && !process.env.ADMIN_PASSWORD_1) {
        errors.push('ADMIN_PASSWORD_1 is required when ADMIN_USERNAME_1 is set')
    }

    if (process.env.ADMIN_USERNAME_2 && !process.env.ADMIN_PASSWORD_2) {
        errors.push('ADMIN_PASSWORD_2 is required when ADMIN_USERNAME_2 is set')
    }

    // Check if Razorpay keys are both present or both absent
    const hasRazorpayId = !!process.env.RAZORPAY_KEY_ID
    const hasRazorpaySecret = !!process.env.RAZORPAY_KEY_SECRET

    if (hasRazorpayId !== hasRazorpaySecret) {
        errors.push('Both RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be provided together')
    }

    // Check if Google OAuth keys are both present or both absent
    const hasGoogleId = !!process.env.GOOGLE_CLIENT_ID
    const hasGoogleSecret = !!process.env.GOOGLE_CLIENT_SECRET

    if (hasGoogleId !== hasGoogleSecret) {
        errors.push('Both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be provided together')
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

export function logEnvironmentStatus(): void {
    const validation = validateEnvironment()

    if (validation.isValid) {
        console.log('✅ Environment validation passed')
    } else {
        console.error('❌ Environment validation failed:')
        validation.errors.forEach(error => console.error(`  - ${error}`))

        if (process.env.NODE_ENV === 'production') {
            throw new Error('Environment validation failed in production')
        }
    }

    // Log configuration status
    console.log('\n📋 Configuration Status:')
    console.log(`  Database: ${process.env.MONGODB_URI ? '✅' : '❌'} Connected`)
    console.log(`  Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? '✅' : '❌'} ${process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured'}`)
    console.log(`  Razorpay: ${process.env.RAZORPAY_KEY_ID ? '✅' : '❌'} ${process.env.RAZORPAY_KEY_ID ? 'Configured' : 'Not configured'}`)
    console.log(`  Admin Auth: ${process.env.ADMIN_USERNAME_1 ? '✅' : '❌'} ${process.env.ADMIN_USERNAME_1 ? 'Configured' : 'Using development defaults'}`)
}
