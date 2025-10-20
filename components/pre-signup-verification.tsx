'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react"

interface PreSignupVerificationProps {
  onVerificationSuccess: (data: { email: string; name: string; verificationToken: string }) => void
}

interface VerificationState {
  step: 'email' | 'code' | 'verified'
  email: string
  name: string
  code: string
  loading: boolean
  error: string
  success: string
  codeSent: boolean
  canResend: boolean
  resendTimer: number
}

export default function PreSignupVerification({ onVerificationSuccess }: PreSignupVerificationProps) {
  const [state, setState] = useState<VerificationState>({
    step: 'email',
    email: '',
    name: '',
    code: '',
    loading: false,
    error: '',
    success: '',
    codeSent: false,
    canResend: false,
    resendTimer: 0
  })

  const startResendTimer = () => {
    setState(prev => ({ ...prev, canResend: false, resendTimer: 60 }))

    const timer = setInterval(() => {
      setState(prev => {
        if (prev.resendTimer <= 1) {
          clearInterval(timer)
          return { ...prev, canResend: true, resendTimer: 0 }
        }
        return { ...prev, resendTimer: prev.resendTimer - 1 }
      })
    }, 1000)
  }

  const sendVerificationCode = async () => {
    if (!state.email || !state.name) {
      setState(prev => ({ ...prev, error: 'Please fill in all fields' }))
      return
    }

    // Simple client-side validation - let server do the real Gmail existence check
    if (!state.email.endsWith('@gmail.com')) {
      setState(prev => ({
        ...prev,
        error: 'Please enter a Gmail address ending with @gmail.com'
      }))
      return
    } setState(prev => ({ ...prev, loading: true, error: '', success: '' }))

    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.email,
          name: state.name
        })
      })

      const data = await response.json()

      if (data.success) {
        setState(prev => ({
          ...prev,
          step: 'code',
          success: 'Verification code sent to your email!',
          codeSent: true,
          loading: false
        }))
        startResendTimer()
      } else {
        setState(prev => ({
          ...prev,
          error: data.error || 'Failed to send verification code',
          loading: false
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Network error. Please try again.',
        loading: false
      }))
    }
  }

  const verifyCode = async () => {
    if (!state.code || state.code.length !== 6) {
      setState(prev => ({ ...prev, error: 'Please enter a valid 6-digit code' }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: '', success: '' }))

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.email,
          code: state.code
        })
      })

      const data = await response.json()

      if (data.success) {
        setState(prev => ({
          ...prev,
          step: 'verified',
          success: 'Email verified successfully!',
          loading: false
        }))

        // Pass verification data to parent
        onVerificationSuccess({
          email: data.email,
          name: data.name,
          verificationToken: data.verificationToken
        })
      } else {
        setState(prev => ({
          ...prev,
          error: data.error || 'Invalid verification code',
          loading: false
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Network error. Please try again.',
        loading: false
      }))
    }
  }

  const resendCode = async () => {
    if (!state.canResend) return

    setState(prev => ({ ...prev, code: '' }))
    await sendVerificationCode()
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
        <CardDescription>
          {state.step === 'email' && 'Verify your email before creating an account'}
          {state.step === 'code' && 'Enter the verification code sent to your email'}
          {state.step === 'verified' && 'Email verified successfully!'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {state.error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              {state.error}
              {state.error.toLowerCase().includes('user already exists') && (
                <div className="mt-2">
                  <p className="text-sm">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                      Sign in here
                    </Link>
                  </p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {state.success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{state.success}</AlertDescription>
          </Alert>
        )}

        {state.step === 'email' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={state.name}
                onChange={(e) => setState(prev => ({ ...prev, name: e.target.value }))}
                disabled={state.loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your Gmail address (e.g., yourname@gmail.com)"
                value={state.email}
                onChange={(e) => setState(prev => ({ ...prev, email: e.target.value }))}
                disabled={state.loading}
              />
              <p className="text-xs text-gray-500">
                💡 Make sure this is a real Gmail address you can access to receive the verification code
              </p>
            </div>

            <Button
              onClick={sendVerificationCode}
              disabled={state.loading}
              className="w-full"
            >
              {state.loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Verification Code
                </>
              )}
            </Button>
          </div>
        )}

        {state.step === 'code' && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <Mail className="h-8 w-8 mx-auto text-blue-500" />
              <p className="text-sm text-gray-600">
                We sent a 6-digit verification code to:<br />
                <strong>{state.email}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={state.code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setState(prev => ({ ...prev, code: value, error: '' }))
                }}
                disabled={state.loading}
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            <Button
              onClick={verifyCode}
              disabled={state.loading || state.code.length !== 6}
              className="w-full"
            >
              {state.loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify Code
                </>
              )}
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                onClick={resendCode}
                disabled={!state.canResend || state.loading}
                className="text-sm"
              >
                {state.canResend
                  ? 'Resend Code'
                  : `Resend in ${state.resendTimer}s`
                }
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => setState(prev => ({
                ...prev,
                step: 'email',
                code: '',
                error: '',
                success: ''
              }))}
              className="w-full"
            >
              Change Email Address
            </Button>
          </div>
        )}

        {state.step === 'verified' && (
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
            <div>
              <h3 className="text-lg font-semibold text-green-700">Email Verified!</h3>
              <p className="text-sm text-gray-600 mt-2">
                Your email <strong>{state.email}</strong> has been successfully verified.
                You can now complete your account registration.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
