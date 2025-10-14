'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2, XCircle, Mail, ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [verificationState, setVerificationState] = useState<{
    status: 'loading' | 'success' | 'error' | 'invalid'
    message: string
    email?: string
  }>({
    status: 'loading',
    message: 'Verifying your email...'
  })

  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (!token) {
      setVerificationState({
        status: 'invalid',
        message: 'Invalid verification link. No token provided.'
      })
      return
    }

    verifyEmail(token)
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${verificationToken}`)
      const data = await response.json()

      if (data.success) {
        setVerificationState({
          status: 'success',
          message: data.message || 'Email verified successfully!',
          email: data.user?.email
        })

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } else {
        setVerificationState({
          status: 'error',
          message: data.error || 'Email verification failed'
        })
      }
    } catch (error) {
      console.error('Verification error:', error)
      setVerificationState({
        status: 'error',
        message: 'Failed to verify email. Please try again.'
      })
    }
  }

  const handleResendVerification = async () => {
    if (!verificationState.email) {
      return
    }

    setIsResending(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: verificationState.email })
      })

      const data = await response.json()

      if (data.success) {
        setVerificationState(prev => ({
          ...prev,
          message: 'New verification email sent! Please check your inbox.'
        }))
      } else {
        setVerificationState(prev => ({
          ...prev,
          message: data.error || 'Failed to resend verification email'
        }))
      }
    } catch (error) {
      console.error('Resend error:', error)
      setVerificationState(prev => ({
        ...prev,
        message: 'Failed to resend verification email'
      }))
    } finally {
      setIsResending(false)
    }
  }

  const getIcon = () => {
    switch (verificationState.status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle2 className="h-12 w-12 text-green-500" />
      case 'error':
      case 'invalid':
        return <XCircle className="h-12 w-12 text-red-500" />
      default:
        return <Mail className="h-12 w-12 text-gray-500" />
    }
  }

  const getAlertVariant = () => {
    switch (verificationState.status) {
      case 'success':
        return 'default' // Success styling
      case 'error':
      case 'invalid':
        return 'destructive'
      default:
        return 'default'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-2xl font-bold">
            {verificationState.status === 'loading' && 'Verifying Email'}
            {verificationState.status === 'success' && 'Email Verified!'}
            {verificationState.status === 'error' && 'Verification Failed'}
            {verificationState.status === 'invalid' && 'Invalid Link'}
          </CardTitle>
          <CardDescription>
            {verificationState.status === 'loading' && 'Please wait while we verify your email address...'}
            {verificationState.status === 'success' && 'Your email has been successfully verified. You can now access all features.'}
            {verificationState.status === 'error' && 'We couldn\'t verify your email address. Please try again or request a new verification link.'}
            {verificationState.status === 'invalid' && 'The verification link is invalid or has expired.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Alert variant={getAlertVariant()}>
            <AlertDescription>
              {verificationState.message}
            </AlertDescription>
          </Alert>

          {verificationState.email && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Email:</strong> {verificationState.email}
              </p>
            </div>
          )}

          {verificationState.status === 'success' && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                🎉 Welcome to Radhika Electronics! You will be redirected to your dashboard in a few seconds.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {verificationState.status === 'success' && (
            <div className="flex gap-2 w-full">
              <Button asChild className="flex-1">
                <Link href="/dashboard">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Link>
              </Button>
            </div>
          )}

          {verificationState.status === 'error' && verificationState.email && (
            <Button
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full"
              variant="outline"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>
          )}

          {(verificationState.status === 'error' || verificationState.status === 'invalid') && (
            <div className="flex gap-2 w-full">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/signup">
                  Sign Up Again
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/login">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Link>
              </Button>
            </div>
          )}

          {verificationState.status === 'loading' && (
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
            <CardDescription>Please wait...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
