"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState, useRef } from "react"
import { userAuth } from "@/lib/user-auth"

interface User {
    email: string
    name: string
    picture?: string
    provider?: string
    loginTime: string
}

export function useAuth() {
    const { data: session, status } = useSession()
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const lastEmailRef = useRef<string | null>(null)

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check NextAuth session first (for Google OAuth)
                if (session?.user) {
                    // Only update if email has changed
                    const sessionEmail = session.user.email!
                    if (lastEmailRef.current !== sessionEmail) {
                        const nextAuthUser: User = {
                            email: sessionEmail,
                            name: session.user.name!,
                            picture: session.user.image || undefined,
                            provider: 'google',
                            loginTime: new Date().toISOString()
                        }

                        // Sync NextAuth session with localStorage for consistency
                        userAuth.login(nextAuthUser)
                        setUser(nextAuthUser)
                        setIsAuthenticated(true)
                        lastEmailRef.current = sessionEmail
                    }
                    setIsLoading(false)
                    return
                }

                // Check custom localStorage session (for email/password login)
                const localUser = userAuth.getCurrentUser()
                if (localUser) {
                    setUser(localUser)
                    setIsAuthenticated(true)
                    setIsLoading(false)
                    return
                }

                // No session found
                setUser(null)
                setIsAuthenticated(false)
                setIsLoading(false)
            } catch (error) {
                console.error('Auth check error:', error)
                setUser(null)
                setIsAuthenticated(false)
                setIsLoading(false)
            }
        }

        if (status !== "loading") {
            checkAuth()
        }
    }, [session, status])

    const logout = async () => {
        // Clear both NextAuth and localStorage
        const { signOut } = await import("next-auth/react")
        await signOut({ redirect: false })
        userAuth.logout()
        setUser(null)
        setIsAuthenticated(false)
        lastEmailRef.current = null
    }

    return {
        user,
        isAuthenticated,
        isLoading: isLoading || status === "loading",
        logout
    }
}
