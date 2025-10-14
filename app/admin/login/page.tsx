"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Shield, User, Lock, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { adminAuth } from "@/lib/admin-auth"

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showCredentials, setShowCredentials] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  // Check if already authenticated
  useEffect(() => {
    if (adminAuth.isAuthenticated()) {
      router.push("/admin")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!formData.username || !formData.password) {
      setError("Please enter both username and password")
      setIsLoading(false)
      return
    }

    // Simulate loading delay
    setTimeout(async () => {
      const result = await adminAuth.login(formData.username, formData.password)

      if (result.success) {
        toast({
          title: "Login successful!",
          description: `Welcome back, ${result.user?.name}`,
        })
        router.push("/admin")
      } else {
        setError(result.error || "Login failed")
      }

      setIsLoading(false)
    }, 1000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  const adminCredentials = adminAuth.getAdminCredentials()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="bg-blue-600 text-white p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-600 mt-2">Radhika Electronics Admin Panel</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-blue-600">Admin Access</CardTitle>
            <CardDescription className="text-center">
              Enter your admin credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter admin username"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter admin password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Demo Credentials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-left justify-start bg-transparent"
                onClick={() => setShowCredentials(!showCredentials)}
              >
                {showCredentials ? "Hide" : "Show"} Admin Credentials
              </Button>

              {showCredentials && (
                <div className="space-y-2 text-sm">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-600 font-semibold">🔒 Security Notice</span>
                    </div>
                    <p className="text-yellow-800 text-sm mb-3">
                      Admin credentials are now stored securely in environment variables for enhanced security.
                    </p>
                    <div className="bg-gray-100 p-3 rounded border text-xs font-mono">
                      <p className="mb-1"># Set these in your .env.local file:</p>
                      <p className="mb-1">ADMIN_USERNAME_1=admin</p>
                      <p className="mb-1">ADMIN_PASSWORD_1=$2b$10$your.bcrypt.hash.here</p>
                      <p className="mt-2 text-blue-600">
                        📖 See SECURITY-FIXES-GUIDE.md for setup instructions
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center text-xs text-gray-500">
          <p>🔒 This is a secure admin area. All activities are logged.</p>
          <p>For support, contact: jayeshsavaliya3011@gmail.com</p>
        </div>
      </div>
    </div>
  )
}
