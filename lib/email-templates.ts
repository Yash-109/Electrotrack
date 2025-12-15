// Email templates for different types of notifications
// Provides consistent, professional email communication

export interface EmailTemplate {
  subject: string
  htmlBody: string
  textBody: string
}

// Welcome email template for new users
export function getWelcomeEmailTemplate(userName: string): EmailTemplate {
  return {
    subject: '🎉 Welcome to Radhika Electronics!',
    htmlBody: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Welcome to Radhika Electronics! 🎉</h1>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #333333; font-size: 22px; margin: 0 0 20px 0;">Hello ${userName}!</h2>
            <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Thank you for joining Radhika Electronics. We're thrilled to have you as part of our growing community of electronics enthusiasts!</p>

            <div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <p style="color: #333333; font-size: 16px; font-weight: 600; margin: 0 0 15px 0;">What you can do now:</p>
              <ul style="color: #555555; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">🛍️ Browse our extensive electronics catalog</li>
                <li style="margin-bottom: 8px;">🛒 Add items to your cart with one click</li>
                <li style="margin-bottom: 8px;">💳 Place orders with secure payment options</li>
                <li style="margin-bottom: 8px;">📦 Track your deliveries in real-time</li>
                <li>⭐ Save your favorite products for later</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 35px 0;">
              <a href="https://radhikaelectronics.com/dashboard" style="display: inline-block; background-color: #007bff; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(0,123,255,0.3);">Start Shopping</a>
            </div>

            <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 25px 0 0 0;">Happy shopping!</p>
            <p style="color: #333333; font-size: 15px; font-weight: 600; margin: 10px 0 0 0;">The Radhika Electronics Team</p>
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="color: #6c757d; font-size: 13px; margin: 0;">Need help? <a href="https://radhikaelectronics.com/contact" style="color: #007bff; text-decoration: none;">Contact us</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    textBody: `Welcome ${userName}!\n\nThank you for joining Radhika Electronics. You can now browse our catalog, add items to cart, and place orders securely.\n\nHappy shopping!\nRadhika Electronics Team`
  }
}

// Order confirmation template
export function getOrderConfirmationTemplate(userName: string, orderId: string, total: number): EmailTemplate {
  const formattedTotal = total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return {
    subject: `📦 Order Confirmation #${orderId}`,
    htmlBody: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20893a 100%); padding: 30px 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 600;">Order Confirmed!</h1>
          </div>
          <div style="padding: 40px 30px;">
            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${userName},</p>
            <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">Thank you for your order! We've received your order and it's being processed.</p>

            <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 8px; padding: 25px; margin: 25px 0; border: 2px solid #28a745;">
              <div style="text-align: center;">
                <p style="color: #666666; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
                <p style="color: #28a745; font-size: 24px; font-weight: 700; margin: 0 0 20px 0; font-family: 'Courier New', monospace;">#${orderId}</p>
                <div style="background-color: rgba(255,255,255,0.8); padding: 15px; border-radius: 6px; display: inline-block;">
                  <p style="color: #666666; font-size: 14px; margin: 0 0 5px 0;">Order Total</p>
                  <p style="color: #28a745; font-size: 28px; font-weight: 700; margin: 0;">₹${formattedTotal}</p>
                </div>
              </div>
            </div>

            <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #333333; font-size: 18px; margin: 0 0 15px 0;">📋 What happens next?</h3>
              <ul style="color: #555555; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 10px;">We'll process your order within 24 hours</li>
                <li style="margin-bottom: 10px;">You'll receive tracking information once shipped</li>
                <li>Expect delivery within 3-5 business days</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://radhikaelectronics.com/order-tracking" style="display: inline-block; background-color: #007bff; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; margin-right: 10px;">Track Order</a>
              <a href="https://radhikaelectronics.com/dashboard" style="display: inline-block; background-color: #6c757d; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">View Dashboard</a>
            </div>

            <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 25px 0 0 0; text-align: center;">Thank you for choosing <strong>Radhika Electronics!</strong></p>
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="color: #6c757d; font-size: 13px; margin: 0;">Questions? <a href="https://radhikaelectronics.com/contact" style="color: #007bff; text-decoration: none;">Contact our support team</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    textBody: `Order Confirmed!\n\nHi ${userName},\nYour order #${orderId} has been confirmed.\nTotal: ₹${total}\n\nWe'll send tracking info once shipped.\n\nThank you!`
  }
}

// Password reset template
export function getPasswordResetTemplate(userName: string, resetLink: string): EmailTemplate {
  return {
    subject: '🔐 Reset Your Password - Radhika Electronics',
    htmlBody: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">🔐</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 600;">Password Reset Request</h1>
          </div>
          <div style="padding: 40px 30px;">
            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${userName},</p>
            <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">We received a request to reset your password. Click the button below to create a new password:</p>

            <div style="text-align: center; margin: 35px 0;">
              <a href="${resetLink}" style="display: inline-block; background-color: #007bff; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(0,123,255,0.3);">Reset Password</a>
            </div>

            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <p style="color: #856404; font-size: 14px; font-weight: 600; margin: 0 0 10px 0;">⚠️ Security Notice:</p>
              <ul style="color: #856404; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 5px;">This link expires in <strong>1 hour</strong></li>
                <li style="margin-bottom: 5px;">The link can only be used once</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>

            <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <p style="color: #721c24; font-size: 14px; margin: 0; line-height: 1.6;"><strong>Didn't request this?</strong><br>If you didn't request a password reset, please ignore this email. Your password will remain unchanged and secure.</p>
            </div>

            <p style="color: #999999; font-size: 13px; line-height: 1.6; margin: 25px 0 0 0; text-align: center;">If the button doesn't work, copy and paste this link into your browser:<br><span style="color: #007bff; word-break: break-all;">${resetLink}</span></p>
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="color: #6c757d; font-size: 13px; margin: 0;">Need help? <a href="https://radhikaelectronics.com/contact" style="color: #007bff; text-decoration: none;">Contact our security team</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    textBody: `Password Reset Request\n\nHi ${userName},\nClick this link to reset your password: ${resetLink}\n\nLink expires in 1 hour.\nIf you didn't request this, ignore this email.`
  }
}

// Order shipped template
export function getOrderShippedTemplate(userName: string, orderId: string, trackingNumber: string): EmailTemplate {
  return {
    subject: `🚚 Your Order #${orderId} Has Been Shipped!`,
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #007bff; margin-bottom: 20px;">📦 Order Shipped!</h2>
          <p style="font-size: 16px; color: #333;">Hi ${userName},</p>
          <p style="font-size: 16px; color: #333;">Great news! Your order <strong>#${orderId}</strong> is on its way!</p>

          <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">Tracking Number:</p>
            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #007bff;">${trackingNumber}</p>
          </div>

          <p style="font-size: 14px; color: #666;">You can track your package anytime by visiting your order history page.</p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://radhikaelectronics.com/order-tracking" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Track Order</a>
          </div>

          <p style="font-size: 14px; color: #999; margin-top: 30px;">Thank you for shopping with Radhika Electronics!</p>
        </div>
      </div>
    `,
    textBody: `Order Shipped!\n\nHi ${userName},\n\nGreat news! Your order #${orderId} is on its way!\n\nTracking Number: ${trackingNumber}\n\nYou can track your package at: https://radhikaelectronics.com/order-tracking\n\nThank you for shopping with Radhika Electronics!`
  }
}

// Order delivered template
export function getOrderDeliveredTemplate(userName: string, orderId: string): EmailTemplate {
  return {
    subject: `✅ Your Order #${orderId} Has Been Delivered!`,
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #28a745; margin-bottom: 20px;">🎉 Order Delivered!</h2>
          <p style="font-size: 16px; color: #333;">Hi ${userName},</p>
          <p style="font-size: 16px; color: #333;">Your order <strong>#${orderId}</strong> has been successfully delivered!</p>

          <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 18px; color: #155724; font-weight: bold;">✓ Delivery Complete</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #155724;">We hope you love your purchase!</p>
          </div>

          <p style="font-size: 16px; color: #333;">We'd love to hear about your experience:</p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://radhikaelectronics.com/reviews" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin-right: 10px;">Write a Review</a>
            <a href="https://radhikaelectronics.com/dashboard" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Shop Again</a>
          </div>

          <p style="font-size: 14px; color: #999; margin-top: 30px;">Thank you for choosing Radhika Electronics!</p>
        </div>
      </div>
    `,
    textBody: `Order Delivered!\n\nHi ${userName},\n\nYour order #${orderId} has been successfully delivered!\n\nWe hope you love your purchase!\n\nShare your experience: https://radhikaelectronics.com/reviews\n\nThank you for choosing Radhika Electronics!`
  }
}

// Order cancelled template
export function getOrderCancelledTemplate(userName: string, orderId: string, refundAmount: number): EmailTemplate {
  return {
    subject: `❌ Order #${orderId} Cancelled - Refund Initiated`,
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #dc3545; margin-bottom: 20px;">Order Cancelled</h2>
          <p style="font-size: 16px; color: #333;">Hi ${userName},</p>
          <p style="font-size: 16px; color: #333;">Your order <strong>#${orderId}</strong> has been cancelled as requested.</p>

          <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #721c24;">Refund Amount:</p>
            <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #721c24;">₹${refundAmount.toFixed(2)}</p>
          </div>

          <p style="font-size: 14px; color: #666;">The refund will be processed to your original payment method within 5-7 business days.</p>

          <p style="font-size: 16px; color: #333; margin-top: 20px;">We're sorry to see this order cancelled. If you experienced any issues, please let us know how we can improve.</p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://radhikaelectronics.com/contact" style="background: #6c757d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin-right: 10px;">Contact Support</a>
            <a href="https://radhikaelectronics.com/dashboard" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Continue Shopping</a>
          </div>

          <p style="font-size: 14px; color: #999; margin-top: 30px;">We hope to serve you again soon!</p>
        </div>
      </div>
    `,
    textBody: `Order Cancelled\n\nHi ${userName},\n\nYour order #${orderId} has been cancelled.\n\nRefund Amount: ₹${refundAmount.toFixed(2)}\n\nThe refund will be processed within 5-7 business days.\n\nContact us: https://radhikaelectronics.com/contact\n\nRadhika Electronics`
  }
}

// Email verification template
export function getEmailVerificationTemplate(userName: string, verificationLink: string, verificationCode: string): EmailTemplate {
  return {
    subject: '✉️ Verify Your Email - Radhika Electronics',
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #007bff; margin-bottom: 20px;">📧 Verify Your Email</h2>
          <p style="font-size: 16px; color: #333;">Hi ${userName},</p>
          <p style="font-size: 16px; color: #333;">Thank you for signing up! Please verify your email address to complete your registration.</p>

          <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #666;">Your Verification Code:</p>
            <p style="margin: 10px 0; font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px;">${verificationCode}</p>
          </div>

          <p style="font-size: 14px; color: #666; text-align: center;">Or click the button below:</p>

          <div style="text-align: center; margin-top: 20px;">
            <a href="${verificationLink}" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email</a>
          </div>

          <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
        </div>
      </div>
    `,
    textBody: `Verify Your Email\n\nHi ${userName},\n\nThank you for signing up! Please verify your email address.\n\nVerification Code: ${verificationCode}\n\nOr use this link: ${verificationLink}\n\nThis link expires in 24 hours.\n\nRadhika Electronics`
  }
}

// Promotional email template
export function getPromotionalEmailTemplate(userName: string, offerTitle: string, offerDescription: string, discountCode: string): EmailTemplate {
  return {
    subject: `🎁 Special Offer Just For You! ${offerTitle}`,
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
          <h2 style="color: #667eea; margin-bottom: 20px; text-align: center;">🎉 ${offerTitle}</h2>
          <p style="font-size: 16px; color: #333;">Hi ${userName},</p>
          <p style="font-size: 16px; color: #333;">${offerDescription}</p>

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: white;">Use Promo Code:</p>
            <p style="margin: 10px 0; font-size: 28px; font-weight: bold; color: #ffd700; letter-spacing: 3px;">${discountCode}</p>
            <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.9);">Valid for limited time only!</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://radhikaelectronics.com/dashboard" style="background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">Shop Now</a>
          </div>

          <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">*Terms and conditions apply</p>
        </div>
      </div>
    `,
    textBody: `${offerTitle}\n\nHi ${userName},\n\n${offerDescription}\n\nPromo Code: ${discountCode}\n\nShop now: https://radhikaelectronics.com/dashboard\n\n*Terms and conditions apply\n\nRadhika Electronics`
  }
}

// Low stock alert template for wishlist items
export function getLowStockAlertTemplate(userName: string, productName: string, stockCount: number, productUrl: string): EmailTemplate {
  return {
    subject: `⚠️ Hurry! ${productName} - Only ${stockCount} Left!`,
    htmlBody: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); padding: 30px 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 600;">Low Stock Alert!</h1>
          </div>
          <div style="padding: 40px 30px;">
            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${userName},</p>
            <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">An item on your wishlist is running low! Don't miss your chance to get it before it's gone.</p>

            <div style="background: linear-gradient(135deg, #ffe5e5 0%, #ffd4d4 100%); border-radius: 8px; padding: 25px; margin: 25px 0; border: 2px solid #ff6b6b;">
              <h3 style="color: #ff6b6b; font-size: 20px; margin: 0 0 15px 0; text-align: center;">📦 ${productName}</h3>
              <div style="background-color: rgba(255,255,255,0.9); padding: 20px; border-radius: 6px; text-align: center;">
                <p style="color: #666666; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Stock Remaining</p>
                <p style="color: #ff6b6b; font-size: 36px; font-weight: 700; margin: 0; font-family: 'Courier New', monospace;">${stockCount} ${stockCount === 1 ? 'Unit' : 'Units'}</p>
                <p style="color: #999999; font-size: 13px; margin: 10px 0 0 0;">⏰ Limited availability!</p>
              </div>
            </div>

            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <p style="color: #856404; font-size: 14px; font-weight: 600; margin: 0 0 10px 0;">⚡ Act Fast!</p>
              <ul style="color: #856404; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 5px;">Stock is selling quickly</li>
                <li style="margin-bottom: 5px;">May not be restocked soon</li>
                <li>High demand for this item</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 35px 0;">
              <a href="${productUrl}" style="display: inline-block; background-color: #ff6b6b; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(255,107,107,0.3);">Order Now</a>
            </div>

            <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 25px 0 0 0; text-align: center;">Don't let this opportunity slip away!</p>
            <p style="color: #333333; font-size: 15px; font-weight: 600; margin: 10px 0 0 0; text-align: center;">The Radhika Electronics Team</p>
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="color: #6c757d; font-size: 13px; margin: 0;">Questions? <a href="https://radhikaelectronics.com/contact" style="color: #007bff; text-decoration: none;">Contact our support team</a></p>
            <p style="color: #6c757d; font-size: 12px; margin: 10px 0 0 0;">You're receiving this because this item is on your wishlist. <a href="https://radhikaelectronics.com/profile" style="color: #007bff; text-decoration: none;">Manage preferences</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    textBody: `⚠️ Low Stock Alert!\n\nHi ${userName},\n\nAn item on your wishlist is running low!\n\nProduct: ${productName}\nStock Remaining: ${stockCount} ${stockCount === 1 ? 'unit' : 'units'}\n\nOrder now before it's gone: ${productUrl}\n\nDon't miss out!\n\nThe Radhika Electronics Team`
  }
}
