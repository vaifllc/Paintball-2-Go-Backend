const mongoose = require('mongoose');

const FAQSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
    maxlength: [500, 'Question cannot be more than 500 characters']
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'general',
      'safety',
      'equipment',
      'preparation',
      'rules',
      'age',
      'pricing',
      'booking',
      'events',
      'mobile-service'
    ],
    lowercase: true
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  helpful: {
    yes: {
      type: Number,
      default: 0
    },
    no: {
      type: Number,
      default: 0
    }
  },
  relatedFAQs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FAQ'
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Update lastUpdated when FAQ is modified
FAQSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastUpdated = new Date();
  }
  next();
});

// Text index for search functionality
FAQSchema.index({
  question: 'text',
  answer: 'text',
  tags: 'text'
}, {
  weights: {
    question: 3,
    answer: 2,
    tags: 1
  }
});

// Index for category and order
FAQSchema.index({ category: 1, order: 1 });

// Static method to get FAQs by category
FAQSchema.statics.getByCategory = function(category) {
  return this.find({
    category,
    isActive: true
  }).sort({ order: 1, createdAt: 1 });
};

// Static method to search FAQs
FAQSchema.statics.search = function(searchTerm) {
  return this.find({
    $text: { $search: searchTerm },
    isActive: true
  }, {
    score: { $meta: 'textScore' }
  }).sort({
    score: { $meta: 'textScore' }
  });
};

// Instance method to increment view count
FAQSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to mark as helpful
FAQSchema.methods.markHelpful = function(helpful = true) {
  if (helpful) {
    this.helpful.yes += 1;
  } else {
    this.helpful.no += 1;
  }
  return this.save();
};

// Virtual for helpfulness ratio
FAQSchema.virtual('helpfulnessRatio').get(function() {
  const total = this.helpful.yes + this.helpful.no;
  if (total === 0) return 0;
  return (this.helpful.yes / total) * 100;
});

// Ensure virtual fields are serialized
FAQSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('FAQ', FAQSchema);