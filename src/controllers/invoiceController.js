const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const { EmailService } = require('../services/emailService');
const { StripeService } = require('../services/stripeService');
const { validationResult } = require('express-validator');

class InvoiceController {
  // Create invoice
  static async createInvoice(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const invoiceData = {
        ...req.body,
        createdBy: req.user.id,
        status: 'draft'
      };

      // Generate invoice number
      const count = await Invoice.countDocuments();
      invoiceData.invoiceNumber = `INV-${Date.now()}-${count + 1}`;

      const invoice = new Invoice(invoiceData);
      await invoice.save();

      res.status(201).json({
        success: true,
        message: 'Invoice created successfully',
        data: invoice
      });
    } catch (error) {
      console.error('Create invoice error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get all invoices
  static async getAllInvoices(req, res) {
    try {
      const { page = 1, limit = 10, status, customerId } = req.query;

      let query = {};

      if (status) {
        query.status = status;
      }

      if (customerId) {
        query.customerId = customerId;
      }

      // If not admin, only show user's invoices
      if (req.user.role !== 'admin') {
        query.customerId = req.user.id;
      }

      const invoices = await Invoice.find(query)
        .populate('customerId', 'name email')
        .populate('bookingId', 'eventType eventDate')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await Invoice.countDocuments(query);

      res.json({
        success: true,
        count: invoices.length,
        total,
        data: invoices
      });
    } catch (error) {
      console.error('Get all invoices error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get single invoice
  static async getInvoice(req, res) {
    try {
      const invoice = await Invoice.findById(req.params.id)
        .populate('customerId', 'name email')
        .populate('bookingId', 'eventType eventDate customerInfo');

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      // Check if user can access this invoice
      if (req.user.role !== 'admin' && invoice.customerId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this invoice'
        });
      }

      res.json({
        success: true,
        data: invoice
      });
    } catch (error) {
      console.error('Get invoice error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Update invoice
  static async updateInvoice(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const invoice = await Invoice.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      res.json({
        success: true,
        message: 'Invoice updated successfully',
        data: invoice
      });
    } catch (error) {
      console.error('Update invoice error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Send invoice
  static async sendInvoice(req, res) {
    try {
      const invoice = await Invoice.findById(req.params.id)
        .populate('customerId', 'name email');

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      // Update invoice status
      invoice.status = 'sent';
      invoice.sentAt = new Date();
      await invoice.save();

      // Send invoice email
      try {
        await EmailService.sendInvoice(invoice, invoice.customerId.email);
      } catch (emailError) {
        console.error('Failed to send invoice email:', emailError);
        return res.status(500).json({
          success: false,
          message: 'Failed to send invoice email'
        });
      }

      res.json({
        success: true,
        message: 'Invoice sent successfully',
        data: invoice
      });
    } catch (error) {
      console.error('Send invoice error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Process payment for invoice
  static async processPayment(req, res) {
    try {
      const { paymentMethodId } = req.body;

      const invoice = await Invoice.findById(req.params.id);

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      if (invoice.status === 'paid') {
        return res.status(400).json({
          success: false,
          message: 'Invoice is already paid'
        });
      }

      // Create payment intent
      const paymentResult = await StripeService.createPaymentIntent({
        amount: Math.round(invoice.totalAmount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          invoiceId: invoice._id.toString(),
          customerId: invoice.customerId.toString()
        }
      });

      if (paymentResult.success) {
        res.json({
          success: true,
          clientSecret: paymentResult.paymentIntent.client_secret,
          invoiceId: invoice._id
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to create payment intent',
          error: paymentResult.error
        });
      }
    } catch (error) {
      console.error('Process payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Mark invoice as paid
  static async markAsPaid(req, res) {
    try {
      const { paymentMethod, transactionId } = req.body;

      const invoice = await Invoice.findById(req.params.id);

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      invoice.status = 'paid';
      invoice.paidAt = new Date();
      invoice.paymentMethod = paymentMethod || 'manual';
      if (transactionId) {
        invoice.transactionId = transactionId;
      }

      await invoice.save();

      // Send payment confirmation email
      try {
        await EmailService.sendPaymentConfirmation(invoice);
      } catch (emailError) {
        console.error('Failed to send payment confirmation email:', emailError);
      }

      res.json({
        success: true,
        message: 'Invoice marked as paid',
        data: invoice
      });
    } catch (error) {
      console.error('Mark as paid error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Delete invoice
  static async deleteInvoice(req, res) {
    try {
      const invoice = await Invoice.findByIdAndDelete(req.params.id);

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      res.json({
        success: true,
        message: 'Invoice deleted successfully'
      });
    } catch (error) {
      console.error('Delete invoice error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get invoice statistics
  static async getInvoiceStats(req, res) {
    try {
      const { startDate, endDate } = req.query;

      let matchStage = {};
      if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = new Date(startDate);
        if (endDate) matchStage.createdAt.$lte = new Date(endDate);
      }

      const stats = await Invoice.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalInvoices: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            paidInvoices: {
              $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
            },
            paidAmount: {
              $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$totalAmount', 0] }
            },
            pendingInvoices: {
              $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
            },
            pendingAmount: {
              $sum: { $cond: [{ $eq: ['$status', 'sent'] }, '$totalAmount', 0] }
            },
            overdueInvoices: {
              $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] }
            },
            overdueAmount: {
              $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, '$totalAmount', 0] }
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: stats[0] || {
          totalInvoices: 0,
          totalAmount: 0,
          paidInvoices: 0,
          paidAmount: 0,
          pendingInvoices: 0,
          pendingAmount: 0,
          overdueInvoices: 0,
          overdueAmount: 0
        }
      });
    } catch (error) {
      console.error('Get invoice stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = InvoiceController;
