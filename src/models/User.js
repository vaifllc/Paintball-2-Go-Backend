const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  subscriptions: {
    newsletter: {
      type: Boolean,
      default: true
    },
    marketing: {
      type: Boolean,
      default: false
    },
    transactional: {
      type: Boolean,
      default: true
    }
  },
  profile: {
    phone: String,
    dateOfBirth: Date,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'America/Detroit'
    }
  },
  activityHistory: [{
    activityType: {
      type: String,
      enum: ['paintball', 'gellyball', 'archery', 'axe-throwing', 'cornhole']
    },
    date: {
      type: Date,
      default: Date.now
    },
    location: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String
  }],
  loyaltyPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  membershipTier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  tags: [String],
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update loyalty points based on activity
UserSchema.methods.updateLoyaltyPoints = function(activityType) {
  const pointsMap = {
    'paintball': 50,
    'gellyball': 30,
    'archery': 40,
    'axe-throwing': 45,
    'cornhole': 20
  };

  this.loyaltyPoints += pointsMap[activityType] || 10;

  // Update membership tier based on points
  if (this.loyaltyPoints >= 1000) {
    this.membershipTier = 'platinum';
  } else if (this.loyaltyPoints >= 500) {
    this.membershipTier = 'gold';
  } else if (this.loyaltyPoints >= 200) {
    this.membershipTier = 'silver';
  }

  return this.save();
};

// Add activity to history
UserSchema.methods.addActivity = function(activityData) {
  this.activityHistory.push(activityData);
  this.updateLoyaltyPoints(activityData.activityType);
};

module.exports = mongoose.model('User', UserSchema);