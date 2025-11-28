import { log } from './logger'

interface User {
  email: string
  name: string
  picture?: string
  provider?: string
  loginTime: string
  sessionId?: string
}

interface UserSession {
  user: User
  createdAt: number
  expiresAt: number
  isValid: boolean
}

const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

class UserAuthService {
  private readonly STORAGE_KEY = "radhika_user_session"

  isLoggedIn(): boolean {
    if (typeof window === "undefined") return false

    try {
      const session = this.getValidSession()
      return !!session && session.isValid
    } catch (error) {
      log.warn('Session validation failed', error, 'UserAuth')
      this.logout() // Clear invalid session
      return false
    }
  }

  private getValidSession(): UserSession | null {
    const sessionData = localStorage.getItem(this.STORAGE_KEY)
    if (!sessionData) return null

    try {
      const session: UserSession = JSON.parse(sessionData)
      const now = Date.now()

      // Check if session has expired
      if (session.expiresAt && now > session.expiresAt) {
        log.info('Session expired', { email: session.user?.email }, 'UserAuth')
        this.logout()
        return null
      }

      return session
    } catch (error) {
      log.error('Invalid session data', error, 'UserAuth')
      this.logout()
      return null
    }
  }

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null

    const sessionData = localStorage.getItem(this.STORAGE_KEY)
    if (!sessionData) return null

    try {
      const session: UserSession = JSON.parse(sessionData)
      return session.user
    } catch {
      return null
    }
  }

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.STORAGE_KEY)
    }
  }

  login(user: User): void {
    if (typeof window !== "undefined") {
      const session: UserSession = { user }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session))
    }
  }
}

export const userAuth = new UserAuthService()
