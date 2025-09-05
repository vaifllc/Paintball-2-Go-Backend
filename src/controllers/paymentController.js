const { StripeService } = require('../services/stripeService');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const { EmailService } = require('../services/emailService');
const { validationResult } = require('express-validator');

class PaymentController {
  // Create payment intent
  static async createPaymentIntent(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { amount, currency = 'usd', metadata = {} } = req.body;

      // Add user info to metadata if available
      if (req.user) {
        metadata.userId = req.user.id;
        metadata.userEmail = req.user.email;
      }

      const result = await StripeService.createPaymentIntent({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata
      });

      if (result.success) {
        res.json({
          success: true,
          clientSecret: result.paymentIntent.client_secret,
          paymentIntentId: result.paymentIntent.id
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to create payment intent',
          error: result.error
        });
      }
    } catch (error) {
      console.error('Create payment intent error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Confirm payment
  static async confirmPayment(req, res) {
    try {
      const { paymentIntentId, bookingId } = req.body;

      // Update booking payment status if booking ID provided
      if (bookingId) {
        const booking = await Booking.findById(bookingId);
        if (booking) {
          booking.paymentStatus = 'paid';
          await booking.save();

          // Send payment confirmation email
          try {
            const paymentDetails = {
              amount: booking.pricing.totalPrice,
              transactionId: paymentIntentId,
              bookingReference: booking.generateReference()
            };
            await EmailService.sendPaymentConfirmation(paymentDetails, booking.customerInfo.email);
          } catch (emailError) {
            console.error('Failed to send payment confirmation email:', emailError);
          }
        }
      }

      res.json({
        success: true,
        message: 'Payment confirmed successfully'
      });
    } catch (error) {
      console.error('Confirm payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Process refund
  static async processRefund(req, res) {
    try {
      const { paymentIntentId, amount, reason } = req.body;

      // Process refund through Stripe
      const refundResult = await StripeService.processRefund({
        paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason
      });

      if (refundResult.success) {
        res.json({
          success: true,
          message: 'Refund processed successfully',
          data: refundResult.refund
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to process refund',
          error: refundResult.error
        });
      }
    } catch (error) {
      console.error('Process refund error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get payment history
  static async getPaymentHistory(req, res) {
    try {
      const { page = 1, limit = 10, status, startDate, endDate } = req.query;

      let query = {};

      // Filter by user if not admin
      if (req.user.role !== 'admin') {
        query.userId = req.user.id;
      }

      if (status) {
        query.paymentStatus = status;
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const payments = await Booking.find(query)
        .select('customerInfo pricing paymentStatus createdAt eventType eventDate')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await Booking.countDocuments(query);

      res.json({
        success: true,
        count: payments.length,
        total,
        data: payments
      });
    } catch (error) {
      console.error('Get payment history error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Stripe webhook handler
  static async handleWebhook(req, res) {
    try {
      const signature = req.headers['stripe-signature'];

      const result = await StripeService.handleWebhook(req.body, signature);

      if (result.success) {
        const event = result.event;

        // Handle different event types
        switch (event.type) {
          case 'payment_intent.succeeded':
            await PaymentController.handlePaymentSuccess(event.data.object);
            break;
          case 'payment_intent.payment_failed':
            await PaymentController.handlePaymentFailed(event.data.object);
            break;
          case 'charge.dispute.created':
            await PaymentController.handleDispute(event.data.object);
            break;
          default:
            console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Handle successful payment
  static async handlePaymentSuccess(paymentIntent) {
    try {
      const metadata = paymentIntent.metadata;

      if (metadata.bookingId) {
        const booking = await Booking.findById(metadata.bookingId);
        if (booking) {
          booking.paymentStatus = 'paid';
          booking.status = 'confirmed';
          await booking.save();

          // Send confirmation emails
          try {
            await EmailService.sendBookingConfirmation(booking);
          } catch (emailError) {
            console.error('Failed to send booking confirmation:', emailError);
          }
        }
      }

      console.log('Payment succeeded:', paymentIntent.id);
    } catch (error) {
      console.error('Handle payment success error:', error);
    }
  }

  // Handle failed payment
  static async handlePaymentFailed(paymentIntent) {
    try {
      const metadata = paymentIntent.metadata;

      if (metadata.bookingId) {
        const booking = await Booking.findById(metadata.bookingId);
        if (booking) {
          booking.paymentStatus = 'failed';
          await booking.save();
        }
      }

      console.log('Payment failed:', paymentIntent.id);
    } catch (error) {
      console.error('Handle payment failed error:', error);
    }
  }

  // Handle dispute
  static async handleDispute(charge) {
    try {
      // Log dispute for admin review
      console.log('Dispute created for charge:', charge.id);

      // You could send an alert email to admins here
      // await EmailService.sendDisputeAlert(charge);
    } catch (error) {
      console.error('Handle dispute error:', error);
    }
  }

  // Get payment statistics (admin only)
  static async getPaymentStats(req, res) {
    try {
      const { startDate, endDate } = req.query;

      let matchStage = {};
      if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = new Date(startDate);
        if (endDate) matchStage.createdAt.$lte = new Date(endDate);
      }

      const stats = await Booking.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$pricing.totalPrice' },
            totalPayments: { $sum: 1 },
            averagePayment: { $avg: '$pricing.totalPrice' },
            paidCount: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
            },
            pendingCount: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
            },
            failedCount: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'failed'] }, 1, 0] }
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: stats[0] || {
          totalRevenue: 0,
          totalPayments: 0,
          averagePayment: 0,
          paidCount: 0,
          pendingCount: 0,
          failedCount: 0
        }
      });
    } catch (error) {
      console.error('Get payment stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = PaymentController;
