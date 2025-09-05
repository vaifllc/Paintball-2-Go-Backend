const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow guest bookings
  },
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    enum: ['paintball', 'gellyball', 'archery', 'axe-throwing', 'cornhole', 'party-package']
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required']
  },
  eventTime: {
    start: {
      type: String,
      required: [true, 'Start time is required']
    },
    end: {
      type: String,
      required: [true, 'End time is required']
    }
  },
  location: {
    type: {
      type: String,
      enum: ['on-site', 'mobile'],
      default: 'on-site'
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    isPublicEvent: {
      type: Boolean,
      default: false
    }
  },
  numberOfPlayers: {
    type: Number,
    required: [true, 'Number of players is required'],
    min: [1, 'Must have at least 1 player']
  },
  ageGroup: {
    type: String,
    enum: ['kids', 'teens', 'adults', 'mixed'],
    default: 'mixed'
  },
  customerInfo: {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Customer email is required'],
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Customer phone is required']
    },
    organization: String,
    specialRequests: String
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    addOns: [{
      name: String,
      price: Number,
      quantity: {
        type: Number,
        default: 1
      }
    }],
    discounts: [{
      name: String,
      type: {
        type: String,
        enum: ['percentage', 'fixed']
      },
      value: Number
    }],
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    deposit: {
      amount: {
        type: Number,
        default: 0
      },
      paid: {
        type: Boolean,
        default: false
      },
      paidAt: Date
    }
  },
  equipment: {
    rental: {
      paintballGuns: {
        type: Number,
        default: 0
      },
      masks: {
        type: Number,
        default: 0
      },
      paintballs: {
        type: Number,
        default: 0
      },
      other: [{
        item: String,
        quantity: Number
      }]
    },
    customerProvided: {
      type: Boolean,
      default: false
    },
    notes: String
  },
  waivers: {
    required: {
      type: Boolean,
      default: true
    },
    submitted: [{
      participantName: String,
      email: String,
      submittedAt: {
        type: Date,
        default: Date.now
      },
      documentId: String
    }],
    allSubmitted: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded'],
    default: 'pending'
  },
  notes: {
    customer: String,
    internal: String,
    staff: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      note: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  assignedStaff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  timeline: [{
    event: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  cancellation: {
    reason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    refundAmount: Number,
    refundProcessed: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Calculate total price before saving
BookingSchema.pre('save', function(next) {
  let total = this.pricing.basePrice;

  // Add add-ons
  if (this.pricing.addOns && this.pricing.addOns.length > 0) {
    this.pricing.addOns.forEach(addOn => {
      total += addOn.price * addOn.quantity;
    });
  }

  // Apply discounts
  if (this.pricing.discounts && this.pricing.discounts.length > 0) {
    this.pricing.discounts.forEach(discount => {
      if (discount.type === 'percentage') {
        total -= (total * discount.value / 100);
      } else {
        total -= discount.value;
      }
    });
  }

  this.pricing.totalPrice = Math.max(0, total);
  next();
});

// Add timeline entry when status changes
BookingSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      event: `Status changed to ${this.status}`,
      timestamp: new Date(),
      details: `Booking status updated to ${this.status}`
    });
  }
  next();
});

// Calculate age group based on participants
BookingSchema.methods.calculateAgeGroup = function() {
  // This would be implemented based on participant ages if available
  return this.ageGroup;
};

// Check if booking can be cancelled
BookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const eventDate = new Date(this.eventDate);
  const hoursDifference = (eventDate - now) / (1000 * 60 * 60);

  // Can cancel if more than 24 hours before event
  return hoursDifference > 24 && this.status !== 'cancelled' && this.status !== 'completed';
};

// Generate booking reference
BookingSchema.methods.generateReference = function() {
  const date = new Date(this.eventDate);
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const id = this._id.toString().substr(-4).toUpperCase();

  return `PB2G${year}${month}${day}${id}`;
};

module.exports = mongoose.model('Booking', BookingSchema);