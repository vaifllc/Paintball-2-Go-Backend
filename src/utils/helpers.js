// Utility helper functions

/**
 * Generate a random string for tokens, IDs, etc.
 * @param {number} length - Length of the string to generate
 * @returns {string} Random string
 */
const generateRandomString = (length = 32) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Format currency amount
 * @param {number} amount - Amount in cents
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount / 100);
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize string for database storage
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Calculate age from date of birth
 * @param {Date} dateOfBirth - Date of birth
 * @returns {number} Age in years
 */
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

/**
 * Generate booking reference number
 * @param {Date} eventDate - Event date
 * @param {string} eventType - Type of event
 * @returns {string} Booking reference
 */
const generateBookingReference = (eventDate, eventType) => {
  const date = new Date(eventDate);
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const typeCode = eventType.substring(0, 2).toUpperCase();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

  return `PB2G${year}${month}${day}${typeCode}${random}`;
};

/**
 * Check if date is in the future
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is in the future
 */
const isFutureDate = (date) => {
  return new Date(date) > new Date();
};

/**
 * Get business hours for a given date
 * @param {Date} date - Date to check
 * @returns {object} Business hours object
 */
const getBusinessHours = (date) => {
  const dayOfWeek = new Date(date).getDay();

  // Tuesday = 2
  if (dayOfWeek === 2) {
    return {
      isOpen: true,
      openTime: '12:00',
      closeTime: '19:00',
      timeSlots: ['12:00-14:00', '14:30-16:30', '17:00-19:00']
    };
  }

  // Wednesday-Sunday by appointment
  if (dayOfWeek >= 3 && dayOfWeek <= 0) {
    return {
      isOpen: true,
      openTime: 'By Appointment',
      closeTime: 'By Appointment',
      timeSlots: []
    };
  }

  // Monday closed
  return {
    isOpen: false,
    openTime: null,
    closeTime: null,
    timeSlots: []
  };
};

/**
 * Calculate pricing for events
 * @param {string} eventType - Type of event
 * @param {number} players - Number of players
 * @param {array} addOns - Array of add-ons
 * @returns {object} Pricing breakdown
 */
const calculateEventPricing = (eventType, players, addOns = []) => {
  const basePrices = {
    'paintball': 25,
    'gellyball': 20,
    'archery': 30,
    'axe-throwing': 60, // for 6 people
    'cornhole': 25,
    'party-package': 200
  };

  let basePrice = basePrices[eventType] || 0;

  // Special pricing for axe throwing (per lane)
  if (eventType === 'axe-throwing') {
    const lanes = Math.ceil(players / 6);
    basePrice = 60 * lanes;
  } else {
    basePrice = basePrice * players;
  }

  // Calculate add-ons
  let addOnTotal = 0;
  addOns.forEach(addOn => {
    addOnTotal += addOn.price * (addOn.quantity || 1);
  });

  const subtotal = basePrice + addOnTotal;
  const tax = subtotal * 0.06; // 6% tax
  const total = subtotal + tax;

  return {
    basePrice,
    addOnTotal,
    subtotal,
    tax,
    total: Math.round(total * 100) / 100
  };
};

module.exports = {
  generateRandomString,
  formatCurrency,
  isValidEmail,
  sanitizeString,
  calculateAge,
  formatPhoneNumber,
  generateBookingReference,
  isFutureDate,
  getBusinessHours,
  calculateEventPricing
};