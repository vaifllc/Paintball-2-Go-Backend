const mongoose = require('mongoose')
const { Schema } = mongoose

const PriceOptionSchema = new Schema({
  key: { type: String }, // e.g. "monthly", "annual", "one_time"
  amount: { type: Number, required: true, min: 0 }, // in dollars
  currency: { type: String, default: 'usd' },
  interval: { type: String, enum: [null, 'month', 'year'], default: null },
  stripePriceId: { type: String }
}, { _id: false })

const PricingItemSchema = new Schema({
  key: { type: String, required: true, unique: true }, // stable identifier, e.g. 'membership_seasonal_10m'
  name: { type: String, required: true },
  type: { type: String, enum: ['membership', 'package', 'service', 'consumable', 'mobile_service'], required: true },
  description: { type: String },
  active: { type: Boolean, default: true },
  stripeProductId: { type: String },
  prices: [PriceOptionSchema],
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true })

// Unique index already enforced by schema-level unique: true

module.exports = mongoose.model('PricingItem', PricingItemSchema)


