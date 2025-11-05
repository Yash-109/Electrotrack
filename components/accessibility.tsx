/**
 * Accessibility utility components and hooks
 */

import { useEffect, useRef } from 'react'

// Hook for managing focus trapping in modals
export function useFocusTrap(isActive: boolean) {
    const containerRef = useRef<HTMLElement>(null)

    useEffect(() => {
        if (!isActive || !containerRef.current) return

        const container = containerRef.current
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )

        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    lastElement?.focus()
                    e.preventDefault()
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    firstElement?.focus()
                    e.preventDefault()
                }
            }
        }

        container.addEventListener('keydown', handleTabKey)
        firstElement?.focus()

        return () => {
            container.removeEventListener('keydown', handleTabKey)
        }
    }, [isActive])

    return containerRef
}

// Hook for announcing content to screen readers
export function useScreenReaderAnnouncement() {
    const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
        const announcement = document.createElement('div')
        announcement.setAttribute('aria-live', priority)
        announcement.setAttribute('aria-atomic', 'true')
        announcement.setAttribute('class', 'sr-only')
        announcement.textContent = message

        document.body.appendChild(announcement)

        setTimeout(() => {
            document.body.removeChild(announcement)
        }, 1000)
    }

    return announce
}

// Hook for managing skip links
export function useSkipLinks() {
    useEffect(() => {
        const skipLinks = document.querySelectorAll('a[href^="#"]')

        const handleSkipClick = (e: Event) => {
            const target = e.target as HTMLAnchorElement
            const targetId = target.getAttribute('href')?.substring(1)

            if (targetId) {
                const targetElement = document.getElementById(targetId)
                if (targetElement) {
                    targetElement.setAttribute('tabindex', '-1')
                    targetElement.focus()

                    // Remove tabindex after focus for normal tab flow
                    targetElement.addEventListener('blur', () => {
                        targetElement.removeAttribute('tabindex')
                    }, { once: true })
                }
            }
        }

        skipLinks.forEach(link => {
            link.addEventListener('click', handleSkipClick)
        })

        return () => {
            skipLinks.forEach(link => {
                link.removeEventListener('click', handleSkipClick)
            })
        }
    }, [])
}

// Component for visually hidden but screen reader accessible text
export function VisuallyHidden({ children, ...props }: { children: React.ReactNode;[key: string]: any }) {
    return (
        <span
            className="sr-only"
            {...props}
        >
            {children}
        </span>
    )
}

// Component for loading states with proper announcements
export function AccessibleLoadingSpinner({
    message = "Loading...",
    size = "md"
}: {
    message?: string
    size?: "sm" | "md" | "lg"
}) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8"
    }

    return (
        <div
            role="status"
            aria-label={message}
            className="flex items-center justify-center"
        >
            <div
                className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
                aria-hidden="true"
            />
            <VisuallyHidden>{message}</VisuallyHidden>
        </div>
    )
}
