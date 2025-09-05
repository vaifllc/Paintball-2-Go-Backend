const express = require('express');
const { body } = require('express-validator');
const InvoiceController = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all invoices
router.get('/', protect, InvoiceController.getAllInvoices);

// Get invoice statistics (admin only)
router.get('/stats', protect, authorize('admin'), InvoiceController.getInvoiceStats);

// Get single invoice
router.get('/:id', protect, InvoiceController.getInvoice);

// Create invoice (admin only)
router.post('/', protect, authorize('admin'), [
  body('customerId').isMongoId().withMessage('Valid customer ID is required'),
  body('items').isArray({ min: 1 }).withMessage('Items array is required'),
  body('items.*.description').notEmpty().withMessage('Item description is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Item quantity must be at least 1'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Item unit price must be positive'),
  body('dueDate').isISO8601().withMessage('Valid due date is required')
], InvoiceController.createInvoice);

// Update invoice (admin only)
router.put('/:id', protect, authorize('admin'), InvoiceController.updateInvoice);

// Send invoice (admin only)
router.post('/:id/send', protect, authorize('admin'), InvoiceController.sendInvoice);

// Process payment for invoice
router.post('/:id/pay', protect, [
  body('paymentMethodId').optional().isString().withMessage('Payment method ID must be a string')
], InvoiceController.processPayment);

// Mark invoice as paid (admin only)
router.patch('/:id/mark-paid', protect, authorize('admin'), [
  body('paymentMethod').optional().isString().withMessage('Payment method must be a string'),
  body('transactionId').optional().isString().withMessage('Transaction ID must be a string')
], InvoiceController.markAsPaid);

// Delete invoice (admin only)
router.delete('/:id', protect, authorize('admin'), InvoiceController.deleteInvoice);

module.exports = router;