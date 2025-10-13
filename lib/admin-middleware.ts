import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from './admin-auth'

export interface AdminAuthRequest extends NextRequest {
    adminUser?: {
        id: string
        username: string
        name: string
        role: string
        email: string
    }
}

export function withAdminAuth(handler: (req: AdminAuthRequest) => Promise<NextResponse>) {
    return async (request: NextRequest): Promise<NextResponse> => {
        try {
            // Check for admin session in headers or cookies
            const authHeader = request.headers.get('x-admin-auth')

            if (!authHeader) {
                return NextResponse.json(
                    { error: 'Admin authentication required' },
                    { status: 401 }
                )
            }

            // Parse the auth header (should contain session data)
            let adminSession
            try {
                adminSession = JSON.parse(authHeader)
            } catch {
                return NextResponse.json(
                    { error: 'Invalid authentication format' },
                    { status: 401 }
                )
            }

            // Validate session expiry
            if (!adminSession.expiresAt || new Date() > new Date(adminSession.expiresAt)) {
                return NextResponse.json(
                    { error: 'Admin session expired' },
                    { status: 401 }
                )
            }

            // Validate user data
            if (!adminSession.user || !adminSession.user.username || !adminSession.user.role) {
                return NextResponse.json(
                    { error: 'Invalid admin session' },
                    { status: 401 }
                )
            }

            // Add admin user to request
            const adminRequest = request as AdminAuthRequest
            adminRequest.adminUser = adminSession.user

            // Call the actual handler
            return await handler(adminRequest)

        } catch (error) {
            console.error('Admin auth middleware error:', error)
            return NextResponse.json(
                { error: 'Authentication error' },
                { status: 500 }
            )
        }
    }
}

// Helper to verify admin role
export function requireAdminRole(role: 'admin' | 'super_admin' = 'admin') {
    return (handler: (req: AdminAuthRequest) => Promise<NextResponse>) => {
        return withAdminAuth(async (request: AdminAuthRequest) => {
            const userRole = request.adminUser?.role

            if (role === 'super_admin' && userRole !== 'super_admin') {
                return NextResponse.json(
                    { error: 'Super admin access required' },
                    { status: 403 }
                )
            }

            if (!userRole || (userRole !== 'admin' && userRole !== 'super_admin')) {
                return NextResponse.json(
                    { error: 'Admin access required' },
                    { status: 403 }
                )
            }

            return await handler(request)
        })
    }
}
