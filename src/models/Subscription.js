const mongoose, { Document, Schema } = require('mongoose');
;
  discounts?{
    code;
    type;
    value;
    expiresAt?;
  }>;
  usageMetrics?{
    sessionsUsed;
    sessionsAllowed;
    lastSessionDate?;
  };
  cancellationReason?;
  cancelledAt?;
  trialStart?;
  trialEnd?;
  createdAt;
  updatedAt;
}
const SubscriptionSchema= new Schema({
  userId{
    type,
    required,
    ref,
  plan{
    type,
    enum,
    required,
  status{
    type,
    enum, 'past_due', 'trialing', 'incomplete'],
    default,
  stripeSubscriptionId{
    type,
    unique,
    sparse,
  stripeCustomerId{
    type,
  startDate{
    type,
    required,
  endDate{
    type,
  renewalDate{
    type,
    required,
  amount{
    type,
    required,
    min: 0
  },
  currency{
    type,
    default,
  billingCycle{
    type,
    enum,
    default,
  features{
    type,
  paymentMethod{
    type{
      type,
      enum, 'bank_account']
    },
    last4{
      type,
    brand{
      type,
  discounts{
    code{
      type,
      required,
    type{
      type,
      enum,
      required,
    value{
      type,
      required,
      min: 0
    },
    expiresAt{
      type,
  usageMetrics{
    sessionsUsed{
      type,
      default: 0,
      min: 0
    },
    sessionsAllowed{
      type,
      default: 0,
      min: 0
    },
    lastSessionDate{
      type,
  cancellationReason{
    type,
    maxlength: 500
  },
  cancelledAt{
    type,
  trialStart{
    type,
  trialEnd{
    type{
  timestamps);
// Index for efficient queries
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ stripeSubscriptionId: 1 });
SubscriptionSchema.index({ renewalDate: 1 });
module.exports = mongoose.model('Subscription', SubscriptionSchema);;
