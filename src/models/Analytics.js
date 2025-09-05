const mongoose, { Document, Schema } = require('mongoose');
;
  ipAddress;
  userAgent;
  referrer?;
  timestamp;
  createdAt;
}
>;
    revenueByActivity{
      activity;
      revenue;
    }>;
    userGrowth;
    subscriptionGrowth;
  };
  createdAt;
  updatedAt;
}
const AnalyticsSchema= new Schema({
  type{
    type,
    enum: ['page_view', 'booking', 'subscription', 'email_open', 'email_click', 'user_action'],
    required,
  userId{
    type,
    ref,
  sessionId{
    type,
    required,
  data{
    page,
    action,
    value,
    metadata: Schema.Types.Mixed
  },
  ipAddress{
    type,
    required,
  userAgent{
    type,
    required,
  referrer,
  timestamp{
    type,
    default: Date.now
  }
}, {
  timestamps);
const DashboardMetricsSchema= new Schema({
  date{
    type,
    required,
    unique,
  metrics{
    totalBookings{
      type,
      default: 0
    },
    totalRevenue{
      type,
      default: 0
    },
    newUsers{
      type,
      default: 0
    },
    activeSubscriptions{
      type,
      default: 0
    },
    pageViews{
      type,
      default: 0
    },
    conversionRate{
      type,
      default: 0
    },
    averageBookingValue{
      type,
      default: 0
    },
    popularActivities{
      activity,
      count,
    revenueByActivity{
      activity,
      revenue,
    userGrowth{
      type,
      default: 0
    },
    subscriptionGrowth{
      type,
      default: 0
    }
  }
}, {
  timestamps);
// Index for efficient queries
AnalyticsSchema.index({ type: 1, timestamp: 1 });
AnalyticsSchema.index({ userId: 1, timestamp: 1 });
AnalyticsSchema.index({ sessionId: 1 });
DashboardMetricsSchema.index({ date: 1 });
const Analytics = mongoose.model('Analytics', AnalyticsSchema);
const DashboardMetrics = mongoose.model('DashboardMetrics', DashboardMetricsSchema);
