const mongoose = require('mongoose');

const EmailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['welcome', 'booking-confirmation', 'payment-confirmation', 'password-reset', 'newsletter']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  variables: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('EmailTemplate', EmailTemplateSchema);