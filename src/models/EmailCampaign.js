const mongoose, { Document, Schema } = require('mongoose');
;
  status;
  scheduledAt?;
  sentAt?;
  recipientCount;
  deliveredCount;
  openedCount;
  clickedCount;
  failedCount;
  openRate;
  clickRate;
  createdBy: mongoose.Types.ObjectId;
  createdAt;
  updatedAt;
}
const EmailCampaignSchema= new Schema({
  name{
    type,
    required,
    trim,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  subject{
    type,
    required,
    trim,
    maxlength: [200, 'Subject cannot be more than 200 characters']
  },
  templateId{
    type: Schema.Types.ObjectId,
    ref,
    required,
  recipientFilter{
    type{
      type,
      enum,
      required,
    selectedUsers{
      type: Schema.Types.ObjectId,
      ref,
    tags,
  status{
    type,
    enum,
    default,
    index,
  scheduledAt,
  sentAt,
  recipientCount{
    type,
    default: 0,
    min: 0
  },
  deliveredCount{
    type,
    default: 0,
    min: 0
  },
  openedCount{
    type,
    default: 0,
    min: 0
  },
  clickedCount{
    type,
    default: 0,
    min: 0
  },
  failedCount{
    type,
    default: 0,
    min: 0
  },
  openRate{
    type,
    default: 0,
    min: 0,
    max: 100
  },
  clickRate{
    type,
    default: 0,
    min: 0,
    max: 100
  },
  createdBy{
    type: Schema.Types.ObjectId,
    ref,
    required{
  timestamps);
// Index for efficient querying
EmailCampaignSchema.index({ status: 1, scheduledAt: 1 });
EmailCampaignSchema.index({ createdBy: 1, updatedAt: -1 });
// Calculate rates before saving
EmailCampaignSchema.pre('save', function(next) {
  if ((this).deliveredCount > 0) {
    (this).openRate = ((this).openedCount / (this).deliveredCount) * 100;
    (this).clickRate = ((this).clickedCount / (this).deliveredCount) * 100;
  }
  next();
});
module.exports = mongoose.model('EmailCampaign', EmailCampaignSchema);;
