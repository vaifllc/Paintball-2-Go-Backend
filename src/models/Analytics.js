const mongoose = require('mongoose')
const { Schema } = mongoose

const AnalyticsSchema = new Schema({
  type: {
    type: String,
    enum: ['page_view', 'booking', 'subscription', 'email_open', 'email_click', 'user_action'],
    required: true
  },
  userId: { type: String, ref: 'User' },
  sessionId: { type: String, required: true },
  data: {
    page: String,
    action: String,
    value: Number,
    metadata: Schema.Types.Mixed
  },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  referrer: String,
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
})

const DashboardMetricsSchema = new Schema({
  date: { type: Date, required: true, unique: true },
  metrics: {
    totalBookings: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    newUsers: { type: Number, default: 0 },
    activeSubscriptions: { type: Number, default: 0 },
    pageViews: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    averageBookingValue: { type: Number, default: 0 },
    popularActivities: [{ activity: String, count: Number }],
    revenueByActivity: [{ activity: String, revenue: Number }],
    userGrowth: { type: Number, default: 0 },
    subscriptionGrowth: { type: Number, default: 0 }
  }
}, {
  timestamps: true
})

AnalyticsSchema.index({ type: 1, timestamp: 1 })
AnalyticsSchema.index({ userId: 1, timestamp: 1 })
AnalyticsSchema.index({ sessionId: 1 })
DashboardMetricsSchema.index({ date: 1 })

const Analytics = mongoose.model('Analytics', AnalyticsSchema)
const DashboardMetrics = mongoose.model('DashboardMetrics', DashboardMetricsSchema)

module.exports = { Analytics, DashboardMetrics }
