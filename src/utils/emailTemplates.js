const EmailTemplates = {
  welcome: (userName) => ({
    subject: 'Welcome to Paintball 2 Go!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #ff6b35;">Welcome to Paintball 2 Go, ${userName}!</h1>
        <p>Thank you for joining our community! We're excited to bring the action to you.</p>
        <p>Get ready for an unforgettable paintball experience!</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}" style="background-color: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">
            Book Your First Event
          </a>
        </div>
        <p>Best regards,<br>The Paintball 2 Go Team</p>
      </div>
    `
  }),

  passwordReset: (userName, resetToken) => ({
    subject: 'Reset Your Paintball 2 Go Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #ff6b35;">Password Reset Request</h1>
        <p>Hi ${userName},</p>
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" style="background-color: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </div>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>Best regards,<br>The Paintball 2 Go Team</p>
      </div>
    `
  }),

  bookingConfirmation: (bookingDetails) => ({
    subject: 'Booking Confirmation - Paintball 2 Go',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #ff6b35;">Booking Confirmed!</h1>
        <p>Hi ${bookingDetails.customerInfo.name},</p>
        <p>Your ${bookingDetails.eventType} booking has been confirmed!</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Booking Details:</h3>
          <p><strong>Event:</strong> ${bookingDetails.eventType}</p>
          <p><strong>Date:</strong> ${new Date(bookingDetails.eventDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${bookingDetails.eventTime.start} - ${bookingDetails.eventTime.end}</p>
          <p><strong>Players:</strong> ${bookingDetails.numberOfPlayers}</p>
          <p><strong>Total:</strong> $${bookingDetails.pricing.totalPrice}</p>
        </div>
        <p>We'll contact you 24 hours before your event to confirm details.</p>
        <p>Best regards,<br>The Paintball 2 Go Team</p>
      </div>
    `
  }),

  paymentConfirmation: (paymentDetails) => ({
    subject: 'Payment Received - Paintball 2 Go',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #ff6b35;">Payment Received</h1>
        <p>Thank you! Your payment has been successfully processed.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Payment Details:</h3>
          <p><strong>Amount:</strong> $${paymentDetails.amount}</p>
          <p><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>Best regards,<br>The Paintball 2 Go Team</p>
      </div>
    `
  }),

  waiverConfirmation: (waiverDetails) => ({
    subject: 'Waiver Received - Paintball 2 Go',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #ff6b35;">Waiver Received</h1>
        <p>Hi ${waiverDetails.participantInfo.name},</p>
        <p>We've received your signed waiver. You're all set for your paintball adventure!</p>
        <p>Best regards,<br>The Paintball 2 Go Team</p>
      </div>
    `
  })
};

module.exports = { EmailTemplates };