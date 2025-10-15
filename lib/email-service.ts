// Professional Email Verification Service
// Uses Nodemailer with Gmail SMTP for reliable email delivery

import nodemailer from 'nodemailer'
import crypto from 'crypto'

// Email configuration - In production, use environment variables
const EMAIL_CONFIG = {
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.GMAIL_USER || 'your-app-email@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password'
  }
}

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport(EMAIL_CONFIG)
  }
  return transporter
}

// Generate secure verification token
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Generate verification URL
export function generateVerificationUrl(token: string, baseUrl: string = 'http://localhost:3000'): string {
  return `${baseUrl}/verify-email?token=${token}`
}

// Email template for verification
export function createVerificationEmailHtml(verificationUrl: string, userName: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Radhika Electronics</title>
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
                border-radius: 10px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 10px;
            }
            .title {
                font-size: 24px;
                color: #2c3e50;
                margin-bottom: 20px;
            }
            .message {
                font-size: 16px;
                color: #555;
                margin-bottom: 30px;
                line-height: 1.8;
            }
            .verify-button {
                display: inline-block;
                background: linear-gradient(135deg, #007bff, #0056b3);
                color: white;
                text-decoration: none;
                padding: 15px 30px;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
                text-align: center;
                margin: 20px 0;
                box-shadow: 0 3px 10px rgba(0, 123, 255, 0.3);
                transition: all 0.3s ease;
            }
            .verify-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 123, 255, 0.4);
            }
            .alternative-link {
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
                word-break: break-all;
                font-family: monospace;
                font-size: 14px;
                color: #6c757d;
            }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                font-size: 14px;
                color: #777;
                text-align: center;
            }
            .security-notice {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
            }
            .features {
                margin: 30px 0;
                padding: 20px;
                background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                border-radius: 8px;
            }
            .feature-list {
                list-style: none;
                padding: 0;
            }
            .feature-list li {
                padding: 8px 0;
                border-bottom: 1px solid #dee2e6;
            }
            .feature-list li:last-child {
                border-bottom: none;
            }
            .feature-list li:before {
                content: "✓";
                color: #28a745;
                font-weight: bold;
                margin-right: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">⚡ Radhika Electronics</div>
                <h1 class="title">Verify Your Email Address</h1>
            </div>

            <div class="message">
                <p>Hello <strong>${userName}</strong>,</p>

                <p>Welcome to Radhika Electronics! We're excited to have you join our community of electronics enthusiasts.</p>

                <p>To complete your registration and ensure the security of your account, please verify your email address by clicking the button below:</p>
            </div>

            <div style="text-align: center;">
                <a href="${verificationUrl}" class="verify-button">
                    🔐 Verify My Email Address
                </a>
            </div>

            <div class="security-notice">
                <strong>🛡️ Security Notice:</strong> This verification link will expire in 24 hours for your security. If you didn't create an account with us, you can safely ignore this email.
            </div>

            <div class="features">
                <h3 style="color: #2c3e50; margin-bottom: 15px;">What you'll get access to:</h3>
                <ul class="feature-list">
                    <li>Exclusive deals on the latest electronics</li>
                    <li>Fast and secure online ordering</li>
                    <li>Order tracking and history</li>
                    <li>Priority customer support</li>
                    <li>Early access to new products</li>
                </ul>
            </div>

            <p style="font-size: 14px; color: #666;">
                <strong>Having trouble with the button?</strong> Copy and paste this link into your browser:
            </p>
            <div class="alternative-link">
                ${verificationUrl}
            </div>

            <div class="footer">
                <p><strong>Radhika Electronics</strong></p>
                <p>Your trusted partner for quality electronics</p>
                <p style="font-size: 12px; color: #aaa;">
                    This email was sent to verify your account. If you have any questions,
                    contact our support team.
                </p>
                <p style="font-size: 12px; color: #aaa;">
                    © 2024 Radhika Electronics. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
  `
}

// Plain text version for email clients that don't support HTML
export function createVerificationEmailText(verificationUrl: string, userName: string): string {
  return `
Hello ${userName},

Welcome to Radhika Electronics!

To complete your registration and verify your email address, please click the following link:

${verificationUrl}

This verification link will expire in 24 hours for security reasons.

If you didn't create an account with us, you can safely ignore this email.

What you'll get access to:
- Exclusive deals on the latest electronics
- Fast and secure online ordering
- Order tracking and history
- Priority customer support
- Early access to new products

If you have any questions, please contact our support team.

Best regards,
Radhika Electronics Team

© 2024 Radhika Electronics. All rights reserved.
  `
}

// Send verification email
export async function sendVerificationEmail(
  toEmail: string,
  userName: string,
  verificationToken: string,
  baseUrl?: string
): Promise<{
  success: boolean
  messageId?: string
  error?: string
}> {
  try {
    const verificationUrl = generateVerificationUrl(verificationToken, baseUrl)

    const mailOptions = {
      from: {
        name: 'Radhika Electronics',
        address: EMAIL_CONFIG.auth.user
      },
      to: toEmail,
      subject: '🔐 Verify Your Email Address - Radhika Electronics',
      html: createVerificationEmailHtml(verificationUrl, userName),
      text: createVerificationEmailText(verificationUrl, userName),
      // Additional email headers for better deliverability
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Mailer': 'Radhika Electronics Verification System'
      }
    }

    const transporter = getTransporter()
    const result = await transporter.sendMail(mailOptions)

    console.log('Verification email sent successfully:', {
      to: toEmail,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    })

    return {
      success: true,
      messageId: result.messageId
    }

  } catch (error: any) {
    console.error('Failed to send verification email:', {
      to: toEmail,
      error: error.message,
      timestamp: new Date().toISOString()
    })

    return {
      success: false,
      error: error.message || 'Failed to send verification email'
    }
  }
}

// Send welcome email after verification
export async function sendWelcomeEmail(
  toEmail: string,
  userName: string
): Promise<{
  success: boolean
  messageId?: string
  error?: string
}> {
  try {
    const welcomeHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
              .container { background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .header { text-align: center; color: #007bff; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
              .message { color: #333; line-height: 1.6; }
              .cta-button { display: inline-block; background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">🎉 Welcome to Radhika Electronics!</div>
              <div class="message">
                  <p>Hello <strong>${userName}</strong>,</p>
                  <p>Congratulations! Your email has been successfully verified and your account is now active.</p>
                  <p>You can now enjoy all the benefits of being a Radhika Electronics customer:</p>
                  <ul>
                      <li>Browse our extensive electronics catalog</li>
                      <li>Get exclusive member discounts</li>
                      <li>Track your orders in real-time</li>
                      <li>Access priority customer support</li>
                  </ul>
                  <div style="text-align: center;">
                      <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard" class="cta-button">
                          Start Shopping Now
                      </a>
                  </div>
                  <p>Thank you for choosing Radhika Electronics!</p>
              </div>
          </div>
      </body>
      </html>
    `

    const mailOptions = {
      from: {
        name: 'Radhika Electronics',
        address: EMAIL_CONFIG.auth.user
      },
      to: toEmail,
      subject: '🎉 Welcome to Radhika Electronics - Your Account is Ready!',
      html: welcomeHtml,
      text: `Welcome to Radhika Electronics!\n\nHello ${userName},\n\nYour email has been verified and your account is now active. Start shopping now at ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard\n\nThank you for choosing Radhika Electronics!`
    }

    const transporter = getTransporter()
    const result = await transporter.sendMail(mailOptions)

    return {
      success: true,
      messageId: result.messageId
    }

  } catch (error: any) {
    console.error('Failed to send welcome email:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Send contact form notification to admin
export async function sendContactNotification(contactData: {
  fullName: string
  email: string
  phone?: string
  subject: string
  message: string
}): Promise<{
  success: boolean
  messageId?: string
  error?: string
}> {
  try {
    const { fullName, email, phone, subject, message } = contactData

    const notificationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
              .container { background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .header { text-align: center; color: #dc3545; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
              .field { margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px; }
              .field-label { font-weight: bold; color: #495057; margin-bottom: 5px; }
              .field-value { color: #6c757d; }
              .message-content { background: white; border: 1px solid #dee2e6; border-radius: 5px; padding: 15px; margin-top: 10px; }
              .urgent { background: linear-gradient(135deg, #dc3545, #c82333); color: white; text-align: center; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="urgent">
                  📧 NEW CONTACT MESSAGE RECEIVED
              </div>
              <div class="header">Contact Form Submission</div>

              <div class="field">
                  <div class="field-label">From:</div>
                  <div class="field-value">${fullName}</div>
              </div>

              <div class="field">
                  <div class="field-label">Email:</div>
                  <div class="field-value">${email}</div>
              </div>

              ${phone ? `<div class="field">
                  <div class="field-label">Phone:</div>
                  <div class="field-value">${phone}</div>
              </div>` : ''}

              <div class="field">
                  <div class="field-label">Subject:</div>
                  <div class="field-value">${subject}</div>
              </div>

              <div class="field">
                  <div class="field-label">Message:</div>
                  <div class="message-content">${message.replace(/\n/g, '<br>')}</div>
              </div>

              <div class="field">
                  <div class="field-label">Submitted At:</div>
                  <div class="field-value">${new Date().toLocaleString()}</div>
              </div>

              <p style="text-align: center; margin-top: 30px; color: #6c757d;">
                  <small>This message was sent through the Radhika Electronics contact form.</small>
              </p>
          </div>
      </body>
      </html>
    `

    const mailOptions = {
      from: {
        name: 'Radhika Electronics Contact Form',
        address: EMAIL_CONFIG.auth.user
      },
      to: 'jayeshsavaliya3011@gmail.com', // Admin email
      subject: `🚨 New Contact Message: ${subject}`,
      html: notificationHtml,
      text: `New Contact Message Received\n\nFrom: ${fullName}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nSubject: ${subject}\n\nMessage:\n${message}\n\nSubmitted at: ${new Date().toLocaleString()}`,
      replyTo: email // Allow admin to reply directly to the customer
    }

    const transporter = getTransporter()
    const result = await transporter.sendMail(mailOptions)

    return {
      success: true,
      messageId: result.messageId
    }

  } catch (error: any) {
    console.error('Failed to send contact notification:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Verify email transporter configuration
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    const transporter = getTransporter()
    await transporter.verify()
    console.log('Email configuration verified successfully')
    return true
  } catch (error) {
    console.error('Email configuration verification failed:', error)
    return false
  }
}
