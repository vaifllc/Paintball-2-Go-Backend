const mongoose = require('mongoose');

const ContentBlockSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  section: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['hero', 'section', 'footer', 'sidebar', 'modal', 'banner']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  version: {
    type: Number,
    default: 1
  },
  publishedAt: Date,
  scheduledAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('ContentBlock', ContentBlockSchema);