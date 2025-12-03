"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Mail, CheckCircle2, Send, Loader2 } from "lucide-react"
import PreSignupVerification from "@/components/pre-signup-verification"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [verificationEmailSent, setVerificationEmailSent] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [verificationData, setVerificationData] = useState<{
    email: string
    name: string
    verificationToken: string
  } | null>(null)
  const { toast } = useToast()

  const handleVerificationSuccess = (data: { email: string; name: string; verificationToken: string }) => {
    setEmailVerified(true)
    setVerificationData(data)
    setFormData(prev => ({
      ...prev,
      email: data.email,
      name: data.name
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Password validation only (email and name come from verification)
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!emailVerified || !verificationData) {
      toast({
        title: "Email verification required",
        description: "Please verify your email first.",
        variant: "destructive",
      })
      return
    }

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Create account with verified email
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: verificationData.name,
          email: verificationData.email,
          password: formData.password,
          emailVerified: true, // Email is already verified
          verificationToken: verificationData.verificationToken,
        }),
      })

      const registerData = await registerResponse.json()

      if (!registerResponse.ok) {
        toast({
          title: "Registration failed",
          description: registerData.error || "Something went wrong. Please try again.",
          variant: "destructive",
        })
        return
      }

      setIsRegistered(true)
      toast({
        title: "Account created successfully! 🎉",
        description: "Your account has been created and your email is verified. You can now log in.",
      })

    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleResendVerification = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Verification email sent! 📧",
          description: "Please check your Gmail inbox for the new verification email.",
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
      setIsLoading(false)
    }
  }

  // Show success page if account is created successfully
  if (isRegistered) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
                <CardTitle className="text-2xl font-bold text-green-600">Account Created Successfully!</CardTitle>
                <CardDescription>Your account has been created and your email is verified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Welcome to Radhika Electronics! Your account for <strong>{verificationData?.email}</strong>
                    is ready to use.
                  </AlertDescription>
                </Alert>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">What&apos;s Next:</h3>
                  <ol className="text-green-700 text-sm space-y-1">
                    <li>1. Your email has been verified ✅</li>
                    <li>2. Your account is fully activated ✅</li>
                    <li>3. You can now log in to your account</li>
                    <li>4. Start shopping at Radhika Electronics!</li>
                  </ol>
                </div>

                <div className="flex flex-col gap-3">
                  <Link href="/login">
                    <Button className="w-full">
                      Go to Login
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          {!emailVerified ? (
            // Step 1: Email Verification
            <PreSignupVerification onVerificationSuccess={handleVerificationSuccess} />
          ) : (
            // Step 2: Complete Registration
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-blue-600">Complete Registration</CardTitle>
                <CardDescription>
                  Email verified for <strong>{verificationData?.email}</strong>.
                  Now create your password to finish registration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={errors.password ? "border-red-500" : ""}
                      placeholder="Enter your password"
                      aria-describedby={errors.password ? "password-error" : undefined}
                      aria-invalid={errors.password ? "true" : "false"}
                    />
                    {errors.password && <p id="password-error" className="text-red-500 text-sm mt-1" role="alert">{errors.password}</p>}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className={errors.confirmPassword ? "border-red-500" : ""}
                      placeholder="Confirm your password"
                      aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                      aria-invalid={errors.confirmPassword ? "true" : "false"}
                    />
                    {errors.confirmPassword && <p id="confirm-password-error" className="text-red-500 text-sm mt-1" role="alert">{errors.confirmPassword}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Complete Registration"
                    )}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => {
                      setEmailVerified(false)
                      setVerificationData(null)
                    }}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Change Email Address
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-600 hover:underline">
                      Login here
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
