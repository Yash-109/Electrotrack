// Pre-signup Email Verification Service
// Sends verification codes before account creation

import nodemailer from 'nodemailer'
import crypto from 'crypto'
import { log } from '@/lib/logger'

// Email configuration
const EMAIL_CONFIG = {
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER || 'your-app-email@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password'
  }
}

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    try {
      transporter = nodemailer.createTransport(EMAIL_CONFIG)
      // Verify connection on first use
      transporter.verify((error) => {
        if (error) {
          log.error('Email transporter verification failed', error, 'pre-signup-verification')
        } else {
          log.info('Email transporter ready', { service: EMAIL_CONFIG.service }, 'pre-signup-verification')
        }
      })
    } catch (error) {
      log.error('Failed to create email transporter', error, 'pre-signup-verification')
      throw new Error('Email service unavailable')
    }
  }
  return transporter
}

// Generate 6-digit verification code with better security
export function generateVerificationCode(): string {
  // Use crypto.randomBytes for better security than Math.random
  const bytes = crypto.randomBytes(4)
  const num = bytes.readUInt32BE(0)
  // Ensure 6 digits by taking modulo and padding
  const code = (num % 900000 + 100000).toString()
  return code
}

// Validate verification code format
export function isValidVerificationCode(code: string): boolean {
  return /^\d{6}$/.test(code) && code.length === 6
}

// Create verification email template
export function createVerificationCodeEmailHtml(verificationCode: string, userName: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gmail Verification Code - Radhika Electronics</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container {
                background: white;
                border-radius: 15px;
                padding: 40px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                text-align: center;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 20px;
            }
            .title {
                font-size: 24px;
                color: #2c3e50;
                margin-bottom: 20px;
            }
            .verification-code {
                background: linear-gradient(135deg, #007bff, #0056b3);
                color: white;
                font-size: 36px;
                font-weight: bold;
                padding: 20px 40px;
                border-radius: 15px;
                letter-spacing: 8px;
                margin: 30px 0;
                display: inline-block;
                box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3);
            }
            .message {
                font-size: 16px;
                color: #555;
                margin: 20px 0;
                line-height: 1.8;
            }
            .security-notice {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
                font-size: 14px;
            }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                font-size: 14px;
                color: #777;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">⚡ Radhika Electronics</div>
            <h1 class="title">Verify Your Gmail Address</h1>

            <p class="message">
                Hello <strong>${userName}</strong>,<br>
                We need to verify your Gmail address before creating your account.
            </p>

            <p class="message">
                Please enter this verification code in the signup form:
            </p>

            <div class="verification-code">${verificationCode}</div>

            <div class="security-notice">
                <strong>🛡️ Security Notice:</strong><br>
                • This code will expire in 10 minutes for your security<br>
                • Only use this code on the Radhika Electronics website<br>
                • If you didn't request this code, you can safely ignore this email
            </div>

            <p class="message">
                After verification, you'll be able to complete your account registration and start shopping with us!
            </p>

            <div class="footer">
                <p><strong>Radhika Electronics</strong></p>
                <p>Your trusted partner for quality electronics</p>
                <p style="font-size: 12px; color: #aaa;">
                    This code was requested for Gmail verification. If you have any questions, contact our support team.
                </p>
            </div>
        </div>
    </body>
    </html>
  `
}

// Plain text version
export function createVerificationCodeEmailText(verificationCode: string, userName: string): string {
  return `
Hello ${userName},

We need to verify your Gmail address before creating your Radhika Electronics account.

Your verification code is: ${verificationCode}

Please enter this code in the signup form to continue.

Security Notice:
- This code will expire in 10 minutes
- Only use this code on the Radhika Electronics website
- If you didn't request this code, you can ignore this email

Thank you for choosing Radhika Electronics!

Best regards,
Radhika Electronics Team
  `
}

// Send verification code email
export async function sendVerificationCode(
  toEmail: string,
  userName: string,
  verificationCode: string
): Promise<{
  success: boolean
  messageId?: string
  error?: string
}> {
  try {
    const mailOptions = {
      from: {
        name: 'Radhika Electronics',
        address: EMAIL_CONFIG.auth.user
      },
      to: toEmail,
      subject: '🔐 Your Gmail Verification Code - Radhika Electronics',
      html: createVerificationCodeEmailHtml(verificationCode, userName),
      text: createVerificationCodeEmailText(verificationCode, userName),
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Mailer': 'Radhika Electronics Verification System'
      }
    }

    const transporter = getTransporter()
    const result = await transporter.sendMail(mailOptions)

    log.info('Verification code sent successfully', {
      to: toEmail,
      code: verificationCode,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    }, 'pre-signup-verification')

    return {
      success: true,
      messageId: result.messageId
    }

  } catch (error: any) {
    log.error('Failed to send verification code', {
      to: toEmail,
      error: error.message,
      timestamp: new Date().toISOString()
    }, 'pre-signup-verification')

    return {
      success: false,
      error: error.message || 'Failed to send verification code'
    }
  }
}
