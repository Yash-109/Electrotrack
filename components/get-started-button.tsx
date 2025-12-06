"use client"

import { useEffect, useState } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useSession } from "next-auth/react"
import { log } from "@/lib/logger"

export default function GetStartedButton() {
    const { data: session, status } = useSession()
    const [localUser, setLocalUser] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check for local user session (for non-Google logins)
        const checkLocalUser = () => {
            if (typeof window !== "undefined") {
                const userSession = localStorage.getItem("radhika_user_session")
                if (userSession) {
                    try {
                        const parsedUser = JSON.parse(userSession)
                        setLocalUser(parsedUser.user)
                    } catch (error) {
                        log.error('Failed to parse user session from localStorage', error, 'GetStartedButton')
                        // Clear corrupted session data
                        localStorage.removeItem("radhika_user_session")
                        setLocalUser(null)
                    }
                }
            }
            setIsLoading(false)
        }

        if (status !== "loading") {
            checkLocalUser()
        }
    }, [status])

    // Show loading state while checking authentication
    if (status === "loading" || isLoading) {
        return (
            <Button size="lg" variant="secondary" className="text-blue-600" disabled>
                <LoadingSpinner size="sm" variant="inline" text="Loading..." />
            </Button>
        )
    }

    // User is authenticated (either Google OAuth or local login)
    if (session?.user || localUser) {
        return (
            <Link href="/profile">
                <Button size="lg" variant="secondary" className="text-blue-600">
                    My Account
                </Button>
            </Link>
        )
    }

    // User is not authenticated
    return (
        <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-blue-600">
                Get Started
            </Button>
        </Link>
    )
}
