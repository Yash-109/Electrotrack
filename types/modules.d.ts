// Global type declarations to fix module resolution issues

declare module 'next/server' {
    export interface NextRequest extends Request {
        nextUrl: URL
        geo?: any
        ip?: string
        cookies: any
    }

    export class NextResponse extends Response {
        static json(body: any, init?: ResponseInit): NextResponse
        static redirect(url: string | URL, init?: ResponseInit): NextResponse
    }
}

declare module 'next/navigation' {
    export function useRouter(): {
        push: (href: string) => void
        replace: (href: string) => void
        refresh: () => void
        back: () => void
        forward: () => void
        prefetch: (href: string) => void
    }

    export function useSearchParams(): URLSearchParams
    export function usePathname(): string
}

declare module 'next/link' {
    import { ComponentProps } from 'react'

    interface LinkProps extends ComponentProps<'a'> {
        href: string
        as?: string
        replace?: boolean
        scroll?: boolean
        shallow?: boolean
        passHref?: boolean
        prefetch?: boolean
        locale?: string
    }

    declare const Link: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>
    export default Link
}

// MongoDB types are now handled by the official @types/mongodb package

declare module 'next-auth' {
    export interface AuthOptions {
        providers: any[]
        adapter?: any
        callbacks?: any
        pages?: any
        session?: any
        secret?: string
    }

    export default function NextAuth(config: AuthOptions): any
}

declare module 'next-auth/providers/google' {
    export default function GoogleProvider(config: {
        clientId: string
        clientSecret: string
    }): any
}

declare module '@auth/mongodb-adapter' {
    export function MongoDBAdapter(clientPromise: Promise<any>): any
}

declare module 'bcryptjs' {
    export function compare(data: string, encrypted: string): Promise<boolean>
    export function hash(data: string, rounds: number): Promise<string>
    export function hashSync(data: string, rounds: number): string
}

declare module 'razorpay' {
    export default class Razorpay {
        constructor(config: { key_id: string; key_secret: string })
        orders: {
            create(options: any): Promise<any>
        }
        payments: {
            fetch(paymentId: string): Promise<any>
        }
    }
}
