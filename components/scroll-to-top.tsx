"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false)
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        const toggleVisibility = () => {
            // Throttle scroll events to improve performance
            if (scrollTimeoutRef.current) return

            scrollTimeoutRef.current = setTimeout(() => {
                const scrollY = window.pageYOffset || document.documentElement.scrollTop
                setIsVisible(scrollY > 300)
                scrollTimeoutRef.current = null
            }, 100) // Check every 100ms instead of on every scroll event
        }

        // Use passive listener for better scroll performance
        window.addEventListener("scroll", toggleVisibility, { passive: true })

        return () => {
            window.removeEventListener("scroll", toggleVisibility)
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current)
            }
        }
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }

    if (!isVisible) {
        return null
    }

    return (
        <Button
            onClick={scrollToTop}
            size="icon"
            className="fixed bottom-8 right-8 z-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            aria-label="Scroll to top"
        >
            <ArrowUp className="h-5 w-5" />
        </Button>
    )
}
