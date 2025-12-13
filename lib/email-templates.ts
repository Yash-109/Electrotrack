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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">Welcome ${userName}!</h2>
        <p>Thank you for joining Radhika Electronics. We're excited to have you as part of our community.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse our electronics catalog</li>
          <li>Add items to your cart</li>
          <li>Place orders securely</li>
          <li>Track your deliveries</li>
        </ul>
        <p>Happy shopping!</p>
        <p><strong>Radhika Electronics Team</strong></p>
      </div>
    `,
    textBody: `Welcome ${userName}!\n\nThank you for joining Radhika Electronics. You can now browse our catalog, add items to cart, and place orders securely.\n\nHappy shopping!\nRadhika Electronics Team`
  }
}

// Order confirmation template
export function getOrderConfirmationTemplate(userName: string, orderId: string, total: number): EmailTemplate {
  return {
    subject: `📦 Order Confirmation #${orderId}`,
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Order Confirmed!</h2>
        <p>Hi ${userName},</p>
        <p>Your order <strong>#${orderId}</strong> has been confirmed.</p>
        <p><strong>Total: ₹${total}</strong></p>
        <p>We'll send you tracking information once your order ships.</p>
        <p>Thank you for choosing Radhika Electronics!</p>
      </div>
    `,
    textBody: `Order Confirmed!\n\nHi ${userName},\nYour order #${orderId} has been confirmed.\nTotal: ₹${total}\n\nWe'll send tracking info once shipped.\n\nThank you!`
  }
}

// Password reset template
export function getPasswordResetTemplate(userName: string, resetLink: string): EmailTemplate {
  return {
    subject: '🔐 Reset Your Password - Radhika Electronics',
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Password Reset Request</h2>
        <p>Hi ${userName},</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetLink}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
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
