const mongoose, { Document, Schema } = require('mongoose');
>;
  customerInfo{
    name;
    email;
    phone?;
    address?;
  };
  notes?;
  createdAt;
  updatedAt;
}
const InvoiceSchema= new Schema({
  userId{
    type,
    required,
    ref,
  bookingId{
    type,
    ref,
  subscriptionId{
    type,
    ref,
  invoiceNumber{
    type,
    required,
    unique,
  amount{
    type,
    required,
    min: 0
  },
  tax{
    type,
    default: 0,
    min: 0
  },
  totalAmount{
    type,
    required,
    min: 0
  },
  status{
    type,
    enum,
    default,
  paymentMethod{
    type,
    enum,
  paymentId{
    type,
  dueDate{
    type,
    required,
  paidAt{
    type,
  description{
    type,
    required,
  lineItems{
    description{
      type,
      required,
    quantity{
      type,
      required,
      min: 1
    },
    unitPrice{
      type,
      required,
      min: 0
    },
    totalPrice{
      type,
      required,
      min: 0
    }
  }],
  customerInfo{
    name{
      type,
      required,
    email{
      type,
      required,
    phone{
      type,
    address{
      type,
  notes{
    type,
    maxlength: 1000
  }
}, {
  timestamps);
// Generate invoice number
InvoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Invoice').countDocuments({
      createdAt{
        $gte: new Date(year, date.getMonth(), 1),
        $lt: new Date(year, date.getMonth() + 1, 1)
      }
    });
    this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});
// Index for efficient queries
InvoiceSchema.index({ userId: 1, status: 1 });
InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ dueDate: 1 });
module.exports = mongoose.model('Invoice', InvoiceSchema);;
