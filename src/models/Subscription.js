const mongoose = require('mongoose')
const { Schema } = mongoose

const SubscriptionSchema = new Schema({
  userId: { type: String, required: true, ref: 'User' },
  plan: { type: String, enum: ['basic', 'premium', 'enterprise'], required: true },
  status: { type: String, enum: ['active', 'cancelled', 'past_due', 'trialing', 'incomplete'], default: 'active' },
  stripeSubscriptionId: { type: String, unique: true, sparse: true },
  stripeCustomerId: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  renewalDate: { type: Date, required: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'usd' },
  billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
  features: [{ type: String }],
  paymentMethod: {
    type: { type: String, enum: ['card', 'bank_account'] },
    last4: { type: String },
    brand: { type: String }
  },
  discounts: [{
    code: { type: String, required: true },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    expiresAt: { type: Date }
  }],
  usageMetrics: {
    sessionsUsed: { type: Number, default: 0, min: 0 },
    sessionsAllowed: { type: Number, default: 0, min: 0 },
    lastSessionDate: { type: Date }
  },
  cancellationReason: { type: String, maxlength: 500 },
  cancelledAt: { type: Date },
  trialStart: { type: Date },
  trialEnd: { type: Date }
}, {
  timestamps: true
})

SubscriptionSchema.index({ userId: 1, status: 1 })
SubscriptionSchema.index({ stripeSubscriptionId: 1 })
SubscriptionSchema.index({ renewalDate: 1 })

module.exports = mongoose.model('Subscription', SubscriptionSchema)
