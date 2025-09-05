const mongoose = require('mongoose')
const { Schema } = mongoose

const InvoiceSchema = new Schema({
  userId: { type: String, required: true, ref: 'User' },
  bookingId: { type: String, ref: 'Booking' },
  subscriptionId: { type: String, ref: 'Subscription' },
  invoiceNumber: { type: String, required: true, unique: true },
  amount: { type: Number, required: true, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  paymentMethod: { type: String, enum: ['stripe', 'cashapp', 'cash', 'check'] },
  paymentId: { type: String },
  dueDate: { type: Date, required: true },
  paidAt: { type: Date },
  description: { type: String, required: true },
  lineItems: [{
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 }
  }],
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    address: { type: String }
  },
  notes: { type: String, maxlength: 1000 }
}, {
  timestamps: true
})

InvoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const count = await mongoose.model('Invoice').countDocuments({
      createdAt: {
        $gte: new Date(year, date.getMonth(), 1),
        $lt: new Date(year, date.getMonth() + 1, 1)
      }
    })
    this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`
  }
  next()
})

InvoiceSchema.index({ userId: 1, status: 1 })
InvoiceSchema.index({ invoiceNumber: 1 })
InvoiceSchema.index({ dueDate: 1 })

module.exports = mongoose.model('Invoice', InvoiceSchema)
