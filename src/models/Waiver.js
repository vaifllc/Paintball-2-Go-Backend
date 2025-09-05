const mongoose, { Document, Schema } = require('mongoose');
;
  };
  parentGuardianInfo?{
    name;
    email;
    phone;
    relationship;
  };
  emergencyContact{
    name;
    phone;
    relationship;
  };
  medicalInfo?{
    conditions;
    medications;
    allergies;
  };
  activities;
  signatureData{
    signature; // Base64 encoded signature
    signedAt;
    ipAddress;
    userAgent;
  };
  agreedToTerms;
  agreedToPhotography;
  isMinor;
  waiverVersion;
  status;
  expiresAt;
  bookingIds;
  createdAt;
  updatedAt;
}
const WaiverSchema= new Schema({
  userId{
    type,
    ref,
  participantInfo{
    name{
      type,
      required,
      trim,
    email{
      type,
      required,
      trim,
      lowercase,
    phone{
      type,
      required,
      trim,
    dateOfBirth{
      type,
      required,
    address{
      street{
        type,
        required,
        trim,
      city{
        type,
        required,
        trim,
      state{
        type,
        required,
        trim,
      zipCode{
        type,
        required,
        trim,
  parentGuardianInfo{
    name{
      type,
      trim,
    email{
      type,
      trim,
      lowercase,
    phone{
      type,
      trim,
    relationship{
      type,
      trim,
  emergencyContact{
    name{
      type,
      required,
      trim,
    phone{
      type,
      required,
      trim,
    relationship{
      type,
      required,
      trim,
  medicalInfo{
    conditions{
      type,
      trim,
      default,
    medications{
      type,
      trim,
      default,
    allergies{
      type,
      trim,
      default,
  activities{
    type,
    enum, 'axe-throwing']
  }],
  signatureData{
    signature{
      type,
      required,
    signedAt{
      type,
      required,
      default: Date.now
    },
    ipAddress{
      type,
      required,
    userAgent{
      type,
      required,
  agreedToTerms{
    type,
    required,
    default,
  agreedToPhotography{
    type,
    required,
    default,
  isMinor{
    type,
    required,
  waiverVersion{
    type,
    required,
    default: '1.0'
  },
  status{
    type,
    enum,
    default,
  expiresAt{
    type,
    required,
  bookingIds{
    type,
    ref{
  timestamps);
// Calculate minor status and expiration date
WaiverSchema.pre('save', function(next) {
  const now = new Date();
  const eighteenYearsAgo = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
  this.isMinor = (this.participantInfo).dateOfBirth > eighteenYearsAgo;
  // Waiver expires after 1 year
  if (!this.expiresAt) {
    this.expiresAt = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  }
  next();
});
// Index for efficient queries
WaiverSchema.index({ 'participantInfo.email': 1 });
WaiverSchema.index({ userId: 1 });
WaiverSchema.index({ status: 1, expiresAt: 1 });
WaiverSchema.index({ bookingIds: 1 });
module.exports = mongoose.model('Waiver', WaiverSchema);;
