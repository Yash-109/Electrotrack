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
