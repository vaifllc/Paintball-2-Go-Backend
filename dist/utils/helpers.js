"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidActivityForAge = exports.getActivityMinAge = exports.calculateActivityPricing = exports.isValidZipCode = exports.getBusinessHours = exports.addBusinessDays = exports.isFutureDate = exports.isPastDate = exports.maskPhone = exports.maskEmail = exports.getPaginationMetadata = exports.getPaginationParams = exports.getDateRange = exports.dollarsToCents = exports.centsToDollars = exports.generateSlug = exports.sanitizeString = exports.formatPhoneNumber = exports.isValidPhone = exports.isValidEmail = exports.generateInvoiceNumber = exports.isMinor = exports.calculateAge = exports.formatCurrency = exports.generateToken = exports.generateRandomString = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateRandomString = (length = 32) => {
    return crypto_1.default.randomBytes(length).toString('hex');
};
exports.generateRandomString = generateRandomString;
const generateToken = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
exports.generateToken = generateToken;
const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
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
exports.calculateAge = calculateAge;
const isMinor = (dateOfBirth) => {
    return (0, exports.calculateAge)(dateOfBirth) < 18;
};
exports.isMinor = isMinor;
const generateInvoiceNumber = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6);
    return `INV-${year}${month}${day}-${timestamp}`;
};
exports.generateInvoiceNumber = generateInvoiceNumber;
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
const isValidPhone = (phone) => {
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone);
};
exports.isValidPhone = isValidPhone;
const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
};
exports.formatPhoneNumber = formatPhoneNumber;
const sanitizeString = (str) => {
    return str.trim().replace(/[<>]/g, '');
};
exports.sanitizeString = sanitizeString;
const generateSlug = (str) => {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};
exports.generateSlug = generateSlug;
const centsToDollars = (cents) => {
    return cents / 100;
};
exports.centsToDollars = centsToDollars;
const dollarsToCents = (dollars) => {
    return Math.round(dollars * 100);
};
exports.dollarsToCents = dollarsToCents;
const getDateRange = (period) => {
    const now = new Date();
    const endDate = new Date(now);
    let startDate;
    switch (period) {
        case 'day':
            startDate = new Date(now.setDate(now.getDate() - 1));
            break;
        case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
        case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
        case 'year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        default:
            startDate = new Date(now.setMonth(now.getMonth() - 1));
    }
    return { startDate, endDate };
};
exports.getDateRange = getDateRange;
const getPaginationParams = (page, limit) => {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '10', 10);
    const skip = (pageNum - 1) * limitNum;
    return {
        page: pageNum,
        limit: limitNum,
        skip
    };
};
exports.getPaginationParams = getPaginationParams;
const getPaginationMetadata = (total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    return {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage
    };
};
exports.getPaginationMetadata = getPaginationMetadata;
const maskEmail = (email) => {
    const [name, domain] = email.split('@');
    const maskedName = name.length > 2
        ? name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1)
        : name;
    return `${maskedName}@${domain}`;
};
exports.maskEmail = maskEmail;
const maskPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `(${cleaned.substring(0, 3)}) ***-${cleaned.substring(6)}`;
    }
    return phone;
};
exports.maskPhone = maskPhone;
const isPastDate = (date) => {
    return new Date(date) < new Date();
};
exports.isPastDate = isPastDate;
const isFutureDate = (date) => {
    return new Date(date) > new Date();
};
exports.isFutureDate = isFutureDate;
const addBusinessDays = (date, days) => {
    const result = new Date(date);
    let addedDays = 0;
    while (addedDays < days) {
        result.setDate(result.getDate() + 1);
        if (result.getDay() !== 0 && result.getDay() !== 6) {
            addedDays++;
        }
    }
    return result;
};
exports.addBusinessDays = addBusinessDays;
const getBusinessHours = (date) => {
    const dayOfWeek = date.getDay();
    const businessHours = {
        0: 'Closed',
        1: 'Closed',
        2: '12:00 PM - 7:00 PM',
        3: 'By Appointment',
        4: 'By Appointment',
        5: 'By Appointment',
        6: 'By Appointment',
    };
    const hours = businessHours[dayOfWeek];
    const isOpen = hours !== 'Closed';
    return { isOpen, hours };
};
exports.getBusinessHours = getBusinessHours;
const isValidZipCode = (zipCode) => {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zipCode);
};
exports.isValidZipCode = isValidZipCode;
const calculateActivityPricing = (activityType, participants, addOns = []) => {
    let basePrice = 0;
    switch (activityType) {
        case 'paintball':
            basePrice = participants * 25;
            break;
        case 'gellyball':
            basePrice = participants * 20;
            break;
        case 'archery':
            basePrice = participants * 30;
            break;
        case 'axe-throwing':
            basePrice = Math.ceil(participants / 6) * 60;
            break;
        case 'cornhole':
            basePrice = 25;
            break;
        default:
            basePrice = 0;
    }
    const addOnTotal = addOns.reduce((total, addOn) => {
        return total + (addOn.price * addOn.quantity);
    }, 0);
    return basePrice + addOnTotal;
};
exports.calculateActivityPricing = calculateActivityPricing;
const getActivityMinAge = (activityType) => {
    const ageRequirements = {
        'paintball': 13,
        'gellyball': 6,
        'archery': 10,
        'axe-throwing': 18,
        'cornhole': 5
    };
    return ageRequirements[activityType] || 18;
};
exports.getActivityMinAge = getActivityMinAge;
const isValidActivityForAge = (activityType, participantAge) => {
    const minAge = (0, exports.getActivityMinAge)(activityType);
    return participantAge >= minAge;
};
exports.isValidActivityForAge = isValidActivityForAge;
//# sourceMappingURL=helpers.js.map