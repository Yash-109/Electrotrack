"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, User, Shield, Mail, Lock, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { adminAuth } from "@/lib/admin-auth"
import { googleAuth } from "@/lib/google-auth"
import { CartService } from "@/lib/cart-service"

export default function LoginPage() {
  const [userFormData, setUserFormData] = useState({
    email: "",
    password: "",
  })

  const [adminFormData, setAdminFormData] = useState({
    username: "",
    password: "",
  })

  const [showUserPassword, setShowUserPassword] = useState(false)
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [userErrors, setUserErrors] = useState<Record<string, string>>({})
  const [adminErrors, setAdminErrors] = useState<Record<string, string>>({})
  const [isUserLoading, setIsUserLoading] = useState(false)
  const [isAdminLoading, setIsAdminLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showAdminCredentials, setShowAdminCredentials] = useState(false)
  const [emailVerificationState, setEmailVerificationState] = useState<{
    needsVerification: boolean
    email: string
    isResending: boolean
  }>({ needsVerification: false, email: "", isResending: false })

  const router = useRouter()
  const { toast } = useToast()

  const validateUserForm = () => {
    const newErrors: Record<string, string> = {}

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!userFormData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!emailRegex.test(userFormData.email)) {
      newErrors.email = "Please enter a valid email address"
    } else if (!userFormData.email.toLowerCase().endsWith('@gmail.com')) {
      newErrors.email = "Only Gmail addresses (@gmail.com) are supported"
    }

    if (!userFormData.password) {
      newErrors.password = "Password is required"
    }

    setUserErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateAdminForm = () => {
    const newErrors: Record<string, string> = {}

    if (!adminFormData.username.trim()) {
      newErrors.username = "Username is required"
    }

    if (!adminFormData.password) {
      newErrors.password = "Password is required"
    }

    setAdminErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateUserForm()) return

    setIsUserLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userFormData.email,
          password: userFormData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Check if email is verified
        if (!data.user.emailVerified) {
          setEmailVerificationState({
            needsVerification: true,
            email: userFormData.email,
            isResending: false
          })
          toast({
            title: "Email verification required ✉️",
            description: "Please check your Gmail inbox and click the verification link before logging in.",
            variant: "destructive",
          })
          return
        }

        // Store user session
        const userSession = {
          user: {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            businessType: data.user.businessType,
            loginTime: new Date().toISOString(),
          },
        }
        localStorage.setItem("radhika_user_session", JSON.stringify(userSession))

        // Restore cart after login (optional - cart will be loaded when user visits cart page)
        // This ensures cart persistence across sessions

        toast({
          title: "Login successful!",
          description: "Welcome back to Radhika Electronics.",
        })
        // Redirect to user dashboard
        router.push("/dashboard")
      } else {
        setUserErrors({ general: data.error || "Login failed" })
        toast({
          title: "Login failed",
          description: data.error || "Invalid credentials",
          variant: "destructive",
        })
      }
    } catch (error) {
      setUserErrors({ general: "Network error. Please try again." })
      toast({
        title: "Login failed",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsUserLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setEmailVerificationState(prev => ({ ...prev, isResending: true }))

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailVerificationState.email })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Verification email sent! 📧",
          description: "Please check your Gmail inbox for the verification email.",
        })
      } else {
        toast({
          title: "Failed to resend",
          description: data.error || "Please try again later.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Network error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setEmailVerificationState(prev => ({ ...prev, isResending: false }))
    }
  }

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateAdminForm()) return

    setIsAdminLoading(true)

    // Simulate loading delay
    setTimeout(async () => {
      const result = await adminAuth.login(adminFormData.username, adminFormData.password)

      if (result.success) {
        toast({
          title: "Admin login successful!",
          description: `Welcome back, ${result.user?.name}`,
        })
        router.push("/admin")
      } else {
        setAdminErrors({ general: result.error || "Login failed" })
      }

      setIsAdminLoading(false)
    }, 1000)
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)

    try {
      const result = await googleAuth.signInWithGoogle()

      if (result.success && result.user) {
        toast({
          title: "Google login successful!",
          description: `Welcome ${result.user.name}! Redirecting to dashboard...`,
        })

        // Cart will be automatically restored when user visits cart page
        // due to the cart persistence implementation

        // Redirect to dashboard after successful login
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)
      } else {
        toast({
          title: "Google login failed",
          description: result.error || "Unable to complete Google sign-in",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Google login error",
        description: "An unexpected error occurred during Google sign-in",
        variant: "destructive",
      })
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleUserInputChange = (field: string, value: string) => {
    setUserFormData((prev) => ({ ...prev, [field]: value }))
    if (userErrors[field]) {
      setUserErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleAdminInputChange = (field: string, value: string) => {
    setAdminFormData((prev) => ({ ...prev, [field]: value }))
    if (adminErrors[field]) {
      setAdminErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const adminCredentials = adminAuth.getAdminCredentials()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-blue-600">Welcome Back</CardTitle>
              <CardDescription>Choose your login type and enter your credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="user" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="user" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Customer</span>
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </TabsTrigger>
                </TabsList>

                {/* Customer Login */}
                <TabsContent value="user" className="space-y-4 mt-6">
                  <div className="text-center mb-4">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <User className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Customer Login</h3>
                    <p className="text-sm text-gray-600">Access your account and orders</p>
                  </div>

                  <form onSubmit={handleUserSubmit} className="space-y-4">
                    {userErrors.general && (
                      <Alert variant="destructive">
                        <AlertDescription>{userErrors.general}</AlertDescription>
                      </Alert>
                    )}

                    {/* Email verification notice */}
                    {emailVerificationState.needsVerification && (
                      <Alert>
                        <Mail className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <p>Your email address <strong>{emailVerificationState.email}</strong> needs to be verified before you can log in.</p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={handleResendVerification}
                                disabled={emailVerificationState.isResending}
                              >
                                {emailVerificationState.isResending ? "Sending..." : "Resend Verification Email"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEmailVerificationState({ needsVerification: false, email: "", isResending: false })}
                              >
                                Dismiss
                              </Button>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div>
                      <Label htmlFor="user-email">Gmail Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="user-email"
                          type="email"
                          placeholder="Enter your Gmail address"
                          value={userFormData.email}
                          onChange={(e) => handleUserInputChange("email", e.target.value)}
                          className={`pl-10 ${userErrors.email ? "border-red-500" : ""}`}
                          disabled={isUserLoading}
                        />
                      </div>
                      {userErrors.email && <p className="text-red-500 text-sm mt-1">{userErrors.email}</p>}

                      {/* Email verification notice */}
                      <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded mt-2">
                        <Info className="inline h-3 w-3 mr-1" />
                        Only Gmail addresses (@gmail.com) are supported. Your email must be verified to log in.
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="user-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="user-password"
                          type={showUserPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={userFormData.password}
                          onChange={(e) => handleUserInputChange("password", e.target.value)}
                          className={`pl-10 pr-10 ${userErrors.password ? "border-red-500" : ""}`}
                          disabled={isUserLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowUserPassword(!showUserPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          disabled={isUserLoading}
                        >
                          {showUserPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {userErrors.password && <p className="text-red-500 text-sm mt-1">{userErrors.password}</p>}
                    </div>

                    <div className="flex justify-between items-center">
                      <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                        Forgot password?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isUserLoading}
                    >
                      {isUserLoading ? "Logging in..." : "Login as Customer"}
                    </Button>
                  </form>

                  {/* Email Verification Status */}
                  {emailVerificationState.needsVerification && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Mail className="h-5 w-5 text-yellow-600 mr-2" />
                        <h4 className="font-semibold text-yellow-800">Email Verification Required</h4>
                      </div>
                      <p className="text-yellow-700 text-sm mb-3">
                        Your account exists but your email <strong>{emailVerificationState.email}</strong> is not verified yet.
                      </p>
                      <div className="space-y-2">
                        <p className="text-yellow-700 text-xs">
                          • Check your Gmail inbox for the verification email<br />
                          • If the Gmail address doesn&apos;t exist, you won&apos;t receive any email<br />
                          • Click the verification link to activate your account
                        </p>
                        <Button
                          onClick={handleResendVerification}
                          disabled={emailVerificationState.isResending}
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                        >
                          {emailVerificationState.isResending ? "Sending..." : "Resend Verification Email"}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <Separator className="my-4" />
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={handleGoogleLogin}
                      disabled={isGoogleLoading}
                    >
                      {isGoogleLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                          Signing in with Google...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="currentColor"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Continue with Google
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>

                {/* Admin Login */}
                <TabsContent value="admin" className="space-y-4 mt-6">
                  <div className="text-center mb-4">
                    <div className="bg-red-100 text-red-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <Shield className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Admin Login</h3>
                    <p className="text-sm text-gray-600">Access admin dashboard and controls</p>
                  </div>

                  <form onSubmit={handleAdminSubmit} className="space-y-4">
                    {adminErrors.general && (
                      <Alert variant="destructive">
                        <AlertDescription>{adminErrors.general}</AlertDescription>
                      </Alert>
                    )}

                    <div>
                      <Label htmlFor="admin-username">Admin Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="admin-username"
                          type="text"
                          placeholder="Enter admin username"
                          value={adminFormData.username}
                          onChange={(e) => handleAdminInputChange("username", e.target.value)}
                          className={`pl-10 ${adminErrors.username ? "border-red-500" : ""}`}
                          disabled={isAdminLoading}
                        />
                      </div>
                      {adminErrors.username && <p className="text-red-500 text-sm mt-1">{adminErrors.username}</p>}
                    </div>

                    <div>
                      <Label htmlFor="admin-password">Admin Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="admin-password"
                          type={showAdminPassword ? "text" : "password"}
                          placeholder="Enter admin password"
                          value={adminFormData.password}
                          onChange={(e) => handleAdminInputChange("password", e.target.value)}
                          className={`pl-10 pr-10 ${adminErrors.password ? "border-red-500" : ""}`}
                          disabled={isAdminLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminPassword(!showAdminPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          disabled={isAdminLoading}
                        >
                          {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {adminErrors.password && <p className="text-red-500 text-sm mt-1">{adminErrors.password}</p>}
                    </div>

                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isAdminLoading}>
                      {isAdminLoading ? "Signing in..." : "Login as Admin"}
                    </Button>
                  </form>

                  {/* Admin Demo Credentials */}
                  <Card className="mt-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center">
                        <Info className="h-4 w-4 mr-2" />
                        Demo Admin Credentials
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start bg-transparent mb-3"
                        onClick={() => setShowAdminCredentials(!showAdminCredentials)}
                      >
                        {showAdminCredentials ? "Hide" : "Show"} Available Admin Accounts
                      </Button>

                      {showAdminCredentials && (
                        <div className="space-y-2 text-sm">
                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center mb-2">
                              <span className="text-red-600 font-semibold">🔒 Admin Security Notice</span>
                            </div>
                            <p className="text-red-800 text-sm mb-3">
                              Admin credentials are now stored securely in environment variables.
                            </p>
                            <div className="bg-gray-100 p-3 rounded border text-xs font-mono">
                              <p className="mb-1"># Configure in .env.local:</p>
                              <p className="mb-1">ADMIN_USERNAME_1=admin</p>
                              <p className="mb-1">ADMIN_PASSWORD_1=$2b$10$your.hash</p>
                              <p className="mt-2 text-red-600">
                                📖 See SECURITY-FIXES-GUIDE.md for details
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-blue-600 hover:underline">
                    Sign up here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="text-center text-xs text-gray-500 mt-4">
            <p>🔒 Your data is secure and encrypted</p>
            <p>Admin access is logged and monitored</p>
          </div>
        </div>
      </div>
    </div>
  )
}
