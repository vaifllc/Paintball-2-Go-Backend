const mongoose = require('mongoose')
const { Schema } = mongoose

const EmailCampaignSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot be more than 200 characters']
  },
  templateId: {
    type: Schema.Types.ObjectId,
    ref: 'EmailTemplate',
    required: [true, 'Template is required']
  },
  recipientFilter: {
    type: {
      type: String,
      enum: ['all', 'selected', 'tag'],
      required: true
    },
    selectedUsers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    tags: [String]
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'],
    default: 'draft',
    index: true
  },
  scheduledAt: Date,
  sentAt: Date,
  recipientCount: { type: Number, default: 0, min: 0 },
  deliveredCount: { type: Number, default: 0, min: 0 },
  openedCount: { type: Number, default: 0, min: 0 },
  clickedCount: { type: Number, default: 0, min: 0 },
  failedCount: { type: Number, default: 0, min: 0 },
  openRate: { type: Number, default: 0, min: 0, max: 100 },
  clickRate: { type: Number, default: 0, min: 0, max: 100 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
})

EmailCampaignSchema.index({ status: 1, scheduledAt: 1 })
EmailCampaignSchema.index({ createdBy: 1, updatedAt: -1 })

EmailCampaignSchema.pre('save', function(next) {
  if (this.deliveredCount > 0) {
    this.openRate = (this.openedCount / this.deliveredCount) * 100
    this.clickRate = (this.clickedCount / this.deliveredCount) * 100
  }
  next()
})

module.exports = mongoose.model('EmailCampaign', EmailCampaignSchema)
