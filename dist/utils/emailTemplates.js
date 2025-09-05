"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailTemplates = void 0;
exports.EmailTemplates = {
    welcome: (name) => ({
        subject: 'Welcome to Paintball 2 Go!',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Paintball 2 Go!</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background-color: #eab308;
            color: white;
            border-radius: 10px 10px 0 0;
          }
          .content {
            padding: 30px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background-color: #1f2937;
            color: white;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #eab308;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .feature {
            margin: 15px 0;
            padding: 15px;
            background-color: #f9fafb;
            border-left: 4px solid #eab308;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Welcome to Paintball 2 Go! 🎯</h1>
          </div>

          <div class="content">
            <h2>Hey ${name}!</h2>

            <p>Welcome to the Paintball 2 Go family! We're thrilled to have you join us for some adrenaline-pumping action and unforgettable experiences.</p>

            <div class="feature">
              <h3>🏆 What You Can Expect:</h3>
              <ul>
                <li><strong>Mobile Entertainment:</strong> We bring the fun directly to you!</li>
                <li><strong>Multiple Activities:</strong> Paintball, Gellyball, Archery Tag, Axe Throwing & more</li>
                <li><strong>Professional Equipment:</strong> Top-quality gear and safety equipment</li>
                <li><strong>Expert Staff:</strong> Trained referees and first-aid certified team</li>
              </ul>
            </div>

            <div class="feature">
              <h3>🎮 Popular Activities:</h3>
              <ul>
                <li><strong>Paintball (13+):</strong> Classic adrenaline-pumping action</li>
                <li><strong>Gellyball (6+):</strong> Low-impact fun for all ages</li>
                <li><strong>Archery Tag (10+):</strong> Bow and arrow combat</li>
                <li><strong>Axe Throwing (18+):</strong> Professional axe throwing experience</li>
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="https://paintball2go.net/book" class="button">Book Your First Event!</a>
            </div>

            <p><strong>Ready to get started?</strong> Browse our activities, check our availability, and book your next adventure. Don't forget to complete your waiver online before your event!</p>

            <p>Questions? We're here to help! Reach out to us at:</p>
            <ul>
              <li>📧 Email: support@paintball2go.net</li>
              <li>📞 Phone: (248) 660-0579</li>
            </ul>
          </div>

          <div class="footer">
            <p>&copy; 2025 Paintball 2 Go LLC. All rights reserved.</p>
            <p>Detroit's Premier Mobile Entertainment Service</p>
          </div>
        </div>
      </body>
      </html>
    `,
        text: `Welcome to Paintball 2 Go!

Hey ${name}!

Welcome to the Paintball 2 Go family! We're thrilled to have you join us for some adrenaline-pumping action and unforgettable experiences.

What You Can Expect:
- Mobile Entertainment: We bring the fun directly to you!
- Multiple Activities: Paintball, Gellyball, Archery Tag, Axe Throwing & more
- Professional Equipment: Top-quality gear and safety equipment
- Expert Staff: Trained referees and first-aid certified team

Popular Activities:
- Paintball (13+): Classic adrenaline-pumping action
- Gellyball (6+): Low-impact fun for all ages
- Archery Tag (10+): Bow and arrow combat
- Axe Throwing (18+): Professional axe throwing experience

Ready to get started? Browse our activities, check our availability, and book your next adventure. Don't forget to complete your waiver online before your event!

Questions? We're here to help!
Email: support@paintball2go.net
Phone: (248) 660-0579

© 2025 Paintball 2 Go LLC. All rights reserved.`
    }),
    bookingConfirmation: (bookingDetails) => ({
        subject: `Booking Confirmed - ${bookingDetails.activityType} on ${bookingDetails.date}`,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmed!</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background-color: #10b981;
            color: white;
            border-radius: 10px 10px 0 0;
          }
          .content {
            padding: 30px;
          }
          .booking-details {
            background-color: #f0fdf4;
            border: 2px solid #10b981;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 10px;
            background-color: white;
            border-radius: 5px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background-color: #1f2937;
            color: white;
            border-radius: 0 0 10px 10px;
          }
          .important {
            background-color: #fef3c7;
            border: 2px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Booking Confirmed!</h1>
          </div>

          <div class="content">
            <h2>Great news, ${bookingDetails.customerName}!</h2>

            <p>Your booking has been confirmed! We're excited to bring the fun to you and create an unforgettable experience.</p>

            <div class="booking-details">
              <h3>📋 Booking Details</h3>

              <div class="detail-row">
                <strong>Activity:</strong>
                <span>${bookingDetails.activityType.charAt(0).toUpperCase() + bookingDetails.activityType.slice(1)}</span>
              </div>

              <div class="detail-row">
                <strong>Date:</strong>
                <span>${new Date(bookingDetails.date).toLocaleDateString()}</span>
              </div>

              <div class="detail-row">
                <strong>Time:</strong>
                <span>${bookingDetails.timeSlot}</span>
              </div>

              <div class="detail-row">
                <strong>Location:</strong>
                <span>${bookingDetails.location}</span>
              </div>

              <div class="detail-row">
                <strong>Participants:</strong>
                <span>${bookingDetails.participants} people</span>
              </div>

              <div class="detail-row">
                <strong>Total Amount:</strong>
                <span>$${bookingDetails.totalAmount.toFixed(2)}</span>
              </div>

              <div class="detail-row">
                <strong>Booking ID:</strong>
                <span>${bookingDetails.id}</span>
              </div>
            </div>

            <div class="important">
              <h3>⚠️ Important Reminders:</h3>
              <ul>
                <li><strong>Waiver Required:</strong> All participants must complete a waiver before the event</li>
                <li><strong>Age Requirements:</strong> Please ensure all participants meet the minimum age requirements</li>
                <li><strong>Weather Policy:</strong> Events may be rescheduled due to severe weather conditions</li>
                <li><strong>Cancellation:</strong> 24-hour notice required for cancellations</li>
              </ul>
            </div>

            <h3>📞 Contact Information:</h3>
            <ul>
              <li>📧 Email: support@paintball2go.net</li>
              <li>📞 Phone: (248) 660-0579</li>
            </ul>

            <p><strong>Questions or need to make changes?</strong> Don't hesitate to reach out to us!</p>
          </div>

          <div class="footer">
            <p>&copy; 2025 Paintball 2 Go LLC. All rights reserved.</p>
            <p>Get ready for an amazing experience! 🎯</p>
          </div>
        </div>
      </body>
      </html>
    `,
        text: `Booking Confirmed!

Great news, ${bookingDetails.customerName}!

Your booking has been confirmed! We're excited to bring the fun to you and create an unforgettable experience.

BOOKING DETAILS:
- Activity: ${bookingDetails.activityType.charAt(0).toUpperCase() + bookingDetails.activityType.slice(1)}
- Date: ${new Date(bookingDetails.date).toLocaleDateString()}
- Time: ${bookingDetails.timeSlot}
- Location: ${bookingDetails.location}
- Participants: ${bookingDetails.participants} people
- Total Amount: $${bookingDetails.totalAmount.toFixed(2)}
- Booking ID: ${bookingDetails.id}

IMPORTANT REMINDERS:
- Waiver Required: All participants must complete a waiver before the event
- Age Requirements: Please ensure all participants meet the minimum age requirements
- Weather Policy: Events may be rescheduled due to severe weather conditions
- Cancellation: 24-hour notice required for cancellations

Contact Information:
Email: support@paintball2go.net
Phone: (248) 660-0579

Questions or need to make changes? Don't hesitate to reach out to us!

© 2025 Paintball 2 Go LLC. All rights reserved.`
    }),
    passwordReset: (name, resetToken) => ({
        subject: 'Password Reset Request - Paintball 2 Go',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background-color: #f59e0b;
            color: white;
            border-radius: 10px 10px 0 0;
          }
          .content {
            padding: 30px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #f59e0b;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .warning {
            background-color: #fef2f2;
            border: 2px solid #ef4444;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background-color: #1f2937;
            color: white;
            border-radius: 0 0 10px 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset Request</h1>
          </div>

          <div class="content">
            <h2>Hello ${name},</h2>

            <p>We received a request to reset your password for your Paintball 2 Go account. If you made this request, click the button below to reset your password:</p>

            <div style="text-align: center;">
              <a href="https://paintball2go.net/auth/reset-password?token=${resetToken}" class="button">Reset Password</a>
            </div>

            <div class="warning">
              <h3>⚠️ Security Notice:</h3>
              <ul>
                <li>This link will expire in 1 hour for security reasons</li>
                <li>If you didn't request a password reset, please ignore this email</li>
                <li>Never share this reset link with anyone</li>
              </ul>
            </div>

            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 5px;">
              https://paintball2go.net/auth/reset-password?token=${resetToken}
            </p>

            <p>If you have any questions or concerns, please contact our support team:</p>
            <ul>
              <li>📧 Email: support@paintball2go.net</li>
              <li>📞 Phone: (248) 660-0579</li>
            </ul>
          </div>

          <div class="footer">
            <p>&copy; 2025 Paintball 2 Go LLC. All rights reserved.</p>
            <p>Keep your account secure! 🔐</p>
          </div>
        </div>
      </body>
      </html>
    `,
        text: `Password Reset Request

Hello ${name},

We received a request to reset your password for your Paintball 2 Go account. If you made this request, visit this link to reset your password:

https://paintball2go.net/auth/reset-password?token=${resetToken}

SECURITY NOTICE:
- This link will expire in 1 hour for security reasons
- If you didn't request a password reset, please ignore this email
- Never share this reset link with anyone

If you have any questions or concerns, please contact our support team:
Email: support@paintball2go.net
Phone: (248) 660-0579

© 2025 Paintball 2 Go LLC. All rights reserved.`
    }),
    paymentConfirmation: (paymentDetails) => ({
        subject: `Payment Confirmed - $${paymentDetails.amount.toFixed(2)}`,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Confirmed</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background-color: #10b981;
            color: white;
            border-radius: 10px 10px 0 0;
          }
          .content {
            padding: 30px;
          }
          .payment-details {
            background-color: #f0fdf4;
            border: 2px solid #10b981;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 10px;
            background-color: white;
            border-radius: 5px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background-color: #1f2937;
            color: white;
            border-radius: 0 0 10px 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Payment Confirmed!</h1>
          </div>

          <div class="content">
            <h2>Thank you for your payment!</h2>

            <p>Your payment has been successfully processed. Here are the details of your transaction:</p>

            <div class="payment-details">
              <h3>💰 Payment Details</h3>

              <div class="detail-row">
                <strong>Amount Paid:</strong>
                <span>$${paymentDetails.amount.toFixed(2)}</span>
              </div>

              <div class="detail-row">
                <strong>Payment Method:</strong>
                <span>${paymentDetails.paymentMethod || 'Credit Card'}</span>
              </div>

              <div class="detail-row">
                <strong>Transaction ID:</strong>
                <span>${paymentDetails.transactionId}</span>
              </div>

              <div class="detail-row">
                <strong>Date:</strong>
                <span>${new Date().toLocaleDateString()}</span>
              </div>

              <div class="detail-row">
                <strong>Description:</strong>
                <span>${paymentDetails.description}</span>
              </div>
            </div>

            <p><strong>What's next?</strong> Your booking is now confirmed and we'll be in touch with final details as your event date approaches.</p>

            <p>Keep this email as your receipt for your records.</p>

            <h3>📞 Questions?</h3>
            <ul>
              <li>📧 Email: support@paintball2go.net</li>
              <li>📞 Phone: (248) 660-0579</li>
            </ul>
          </div>

          <div class="footer">
            <p>&copy; 2025 Paintball 2 Go LLC. All rights reserved.</p>
            <p>Thank you for choosing Paintball 2 Go! 🎯</p>
          </div>
        </div>
      </body>
      </html>
    `,
        text: `Payment Confirmed!

Thank you for your payment!

Your payment has been successfully processed. Here are the details of your transaction:

PAYMENT DETAILS:
- Amount Paid: $${paymentDetails.amount.toFixed(2)}
- Payment Method: ${paymentDetails.paymentMethod || 'Credit Card'}
- Transaction ID: ${paymentDetails.transactionId}
- Date: ${new Date().toLocaleDateString()}
- Description: ${paymentDetails.description}

What's next? Your booking is now confirmed and we'll be in touch with final details as your event date approaches.

Keep this email as your receipt for your records.

Questions?
Email: support@paintball2go.net
Phone: (248) 660-0579

© 2025 Paintball 2 Go LLC. All rights reserved.`
    }),
    waiverConfirmation: (waiverDetails) => ({
        subject: 'Waiver Confirmed - Paintball 2 Go',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Waiver Confirmed</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background-color: #8b5cf6;
            color: white;
            border-radius: 10px 10px 0 0;
          }
          .content {
            padding: 30px;
          }
          .waiver-details {
            background-color: #f3e8ff;
            border: 2px solid #8b5cf6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 10px;
            background-color: white;
            border-radius: 5px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background-color: #1f2937;
            color: white;
            border-radius: 0 0 10px 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Waiver Confirmed!</h1>
          </div>

          <div class="content">
            <h2>Waiver Successfully Submitted</h2>

            <p>Thank you for completing your liability waiver! Your waiver has been successfully submitted and is now on file.</p>

            <div class="waiver-details">
              <h3>📄 Waiver Details</h3>

              <div class="detail-row">
                <strong>Participant:</strong>
                <span>${waiverDetails.participantName}</span>
              </div>

              <div class="detail-row">
                <strong>Activities:</strong>
                <span>${waiverDetails.activities.join(', ')}</span>
              </div>

              <div class="detail-row">
                <strong>Valid Until:</strong>
                <span>${new Date(waiverDetails.expiresAt).toLocaleDateString()}</span>
              </div>

              <div class="detail-row">
                <strong>Signed Date:</strong>
                <span>${new Date(waiverDetails.signedAt).toLocaleDateString()}</span>
              </div>

              ${waiverDetails.isMinor ? `
              <div class="detail-row">
                <strong>Minor Participant:</strong>
                <span>Yes (Parent/Guardian signature required)</span>
              </div>
              ` : ''}
            </div>

            <p><strong>Important:</strong> This waiver is valid for one year from the date signed and covers all the activities you selected.</p>

            <p>You're all set for your upcoming events! No need to fill out another waiver unless you want to add additional activities or if the waiver expires.</p>

            <h3>📞 Questions?</h3>
            <ul>
              <li>📧 Email: support@paintball2go.net</li>
              <li>📞 Phone: (248) 660-0579</li>
            </ul>
          </div>

          <div class="footer">
            <p>&copy; 2025 Paintball 2 Go LLC. All rights reserved.</p>
            <p>Ready for some action! 🎯</p>
          </div>
        </div>
      </body>
      </html>
    `,
        text: `Waiver Confirmed!

Thank you for completing your liability waiver! Your waiver has been successfully submitted and is now on file.

WAIVER DETAILS:
- Participant: ${waiverDetails.participantName}
- Activities: ${waiverDetails.activities.join(', ')}
- Valid Until: ${new Date(waiverDetails.expiresAt).toLocaleDateString()}
- Signed Date: ${new Date(waiverDetails.signedAt).toLocaleDateString()}
${waiverDetails.isMinor ? '- Minor Participant: Yes (Parent/Guardian signature required)' : ''}

Important: This waiver is valid for one year from the date signed and covers all the activities you selected.

You're all set for your upcoming events! No need to fill out another waiver unless you want to add additional activities or if the waiver expires.

Questions?
Email: support@paintball2go.net
Phone: (248) 660-0579

© 2025 Paintball 2 Go LLC. All rights reserved.`
    })
};
//# sourceMappingURL=emailTemplates.js.map