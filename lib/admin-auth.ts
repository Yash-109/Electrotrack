import bcryptjs from 'bcryptjs'

interface AdminUser {
  id: string
  username: string
  passwordHash: string
  name: string
  role: "super_admin" | "admin"
  email: string
  lastLogin?: Date
}

interface AuthResult {
  success: boolean
  user?: Omit<AdminUser, 'passwordHash'>
  error?: string
}

class AdminAuthService {
  private readonly STORAGE_KEY = "radhika_admin_session"
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

  private getAdminUsers(): AdminUser[] {
    // Use environment variables for admin credentials
    const adminUsers: AdminUser[] = []

    // Admin 1 - Super Admin
    if (process.env.ADMIN_USERNAME_1 && process.env.ADMIN_PASSWORD_1) {
      adminUsers.push({
        id: "1",
        username: process.env.ADMIN_USERNAME_1,
        passwordHash: process.env.ADMIN_PASSWORD_1, // Should be bcrypt hash
        name: process.env.ADMIN_NAME_1 || "Super Admin",
        role: "super_admin",
        email: process.env.ADMIN_EMAIL_1 || "admin@radhikaelectronics.com",
      })
    }

    // Admin 2 - Regular Admin
    if (process.env.ADMIN_USERNAME_2 && process.env.ADMIN_PASSWORD_2) {
      adminUsers.push({
        id: "2",
        username: process.env.ADMIN_USERNAME_2,
        passwordHash: process.env.ADMIN_PASSWORD_2, // Should be bcrypt hash
        name: process.env.ADMIN_NAME_2 || "Admin",
        role: "admin",
        email: process.env.ADMIN_EMAIL_2 || "admin@radhikaelectronics.com",
      })
    }

    // Fallback admin (only in development)
    if (process.env.NODE_ENV === 'development' && adminUsers.length === 0) {
      adminUsers.push({
        id: "dev",
        username: "admin",
        passwordHash: bcryptjs.hashSync("admin123", 10), // Default dev password
        name: "Development Admin",
        role: "super_admin",
        email: "dev@localhost",
      })
    }

    return adminUsers
  }

  async login(username: string, password: string): Promise<AuthResult> {
    const adminUsers = this.getAdminUsers()
    const user = adminUsers.find((u) => u.username === username)

    if (!user) {
      return {
        success: false,
        error: "Invalid username or password",
      }
    }

    // Compare password with hash
    const isValidPassword = await bcryptjs.compare(password, user.passwordHash)

    if (!isValidPassword) {
      return {
        success: false,
        error: "Invalid username or password",
      }
    }

    // Create session (exclude password hash)
    const { passwordHash, ...userWithoutPassword } = user
    const session = {
      user: userWithoutPassword,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.SESSION_DURATION).toISOString(),
    }

    // Store in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session))
    }

    return {
      success: true,
      user: userWithoutPassword,
    }
  }

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.STORAGE_KEY)
    }
  }

  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false

    const sessionData = localStorage.getItem(this.STORAGE_KEY)
    if (!sessionData) return false

    try {
      const session = JSON.parse(sessionData)
      const now = new Date()
      const expiresAt = new Date(session.expiresAt)

      if (now > expiresAt) {
        this.logout()
        return false
      }

      return true
    } catch {
      this.logout()
      return false
    }
  }

  getCurrentUser(): AdminUser | null {
    if (!this.isAuthenticated()) return null

    const sessionData = localStorage.getItem(this.STORAGE_KEY)
    if (!sessionData) return null

    try {
      const session = JSON.parse(sessionData)
      return session.user
    } catch {
      return null
    }
  }

  // Alias for getCurrentUser to maintain compatibility
  getCurrentAdmin(): AdminUser | null {
    return this.getCurrentUser()
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser()
    return user?.role === role || user?.role === "super_admin"
  }

  getAdminCredentials() {
    const adminUsers = this.getAdminUsers()
    return adminUsers.map((user) => ({
      username: user.username,
      name: user.name,
      role: user.role,
      email: user.email,
    }))
  }
}

export const adminAuth = new AdminAuthService()
