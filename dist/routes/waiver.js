"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const Waiver_1 = __importDefault(require("../models/Waiver"));
const emailService_1 = require("../services/emailService");
const router = express_1.default.Router();
router.get('/', auth_1.protect, async (req, res) => {
    try {
        const waivers = await Waiver_1.default.find({
            $or: [
                { userId: req.user.id },
                { 'participantInfo.email': req.user.email }
            ]
        }).sort({ createdAt: -1 });
        res.json({ waivers });
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching waivers' });
    }
});
router.get('/check', [
    (0, express_validator_1.query)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.query)('activities').optional().isString()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, activities } = req.query;
        const activitiesArray = activities ? activities.split(',') : [];
        const filter = {
            'participantInfo.email': email,
            status: 'active',
            expiresAt: { $gt: new Date() }
        };
        if (activitiesArray.length > 0) {
            filter.activities = { $in: activitiesArray };
        }
        const waiver = await Waiver_1.default.findOne(filter);
        res.json({
            hasValidWaiver: !!waiver,
            waiver: waiver ? {
                id: waiver._id,
                activities: waiver.activities,
                signedAt: waiver.signatureData.signedAt,
                expiresAt: waiver.expiresAt,
                isMinor: waiver.isMinor
            } : null
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Error checking waiver status' });
    }
});
router.post('/submit', [
    (0, express_validator_1.body)('participantInfo.name').notEmpty().withMessage('Participant name is required'),
    (0, express_validator_1.body)('participantInfo.email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('participantInfo.phone').notEmpty().withMessage('Phone number is required'),
    (0, express_validator_1.body)('participantInfo.dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
    (0, express_validator_1.body)('participantInfo.address.street').notEmpty().withMessage('Street address is required'),
    (0, express_validator_1.body)('participantInfo.address.city').notEmpty().withMessage('City is required'),
    (0, express_validator_1.body)('participantInfo.address.state').notEmpty().withMessage('State is required'),
    (0, express_validator_1.body)('participantInfo.address.zipCode').notEmpty().withMessage('ZIP code is required'),
    (0, express_validator_1.body)('emergencyContact.name').notEmpty().withMessage('Emergency contact name is required'),
    (0, express_validator_1.body)('emergencyContact.phone').notEmpty().withMessage('Emergency contact phone is required'),
    (0, express_validator_1.body)('emergencyContact.relationship').notEmpty().withMessage('Emergency contact relationship is required'),
    (0, express_validator_1.body)('activities').isArray({ min: 1 }).withMessage('At least one activity must be selected'),
    (0, express_validator_1.body)('signatureData.signature').notEmpty().withMessage('Signature is required'),
    (0, express_validator_1.body)('agreedToTerms').equals('true').withMessage('Must agree to terms'),
    (0, express_validator_1.body)('agreedToPhotography').isBoolean().withMessage('Photography agreement must be specified')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const existingWaiver = await Waiver_1.default.findOne({
            'participantInfo.email': req.body.participantInfo.email,
            status: 'active',
            expiresAt: { $gt: new Date() }
        });
        if (existingWaiver) {
            return res.status(400).json({ error: 'Valid waiver already exists for this email' });
        }
        const waiverData = {
            ...req.body,
            userId: req.user?.id,
            signatureData: {
                ...req.body.signatureData,
                signedAt: new Date(),
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'] || ''
            }
        };
        const waiver = new Waiver_1.default(waiverData);
        await waiver.save();
        await emailService_1.EmailService.sendEmail({
            to: waiver.participantInfo.email,
            subject: 'Waiver Confirmation - Paintball 2 Go',
            text: `Your waiver has been submitted successfully and is valid until ${waiver.expiresAt.toDateString()}.`,
            html: `
        <h1>Waiver Confirmed!</h1>
        <p>Your waiver has been submitted successfully.</p>
        <p><strong>Valid until:</strong> ${waiver.expiresAt.toDateString()}</p>
        <p><strong>Activities:</strong> ${waiver.activities.join(', ')}</p>
        <p>Thank you for choosing Paintball 2 Go!</p>
      `
        });
        res.status(201).json({
            message: 'Waiver submitted successfully',
            waiver: {
                id: waiver._id,
                activities: waiver.activities,
                signedAt: waiver.signatureData.signedAt,
                expiresAt: waiver.expiresAt,
                isMinor: waiver.isMinor
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Error submitting waiver' });
    }
});
router.put('/:id/activities', auth_1.protect, [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.body)('activities').isArray({ min: 1 }).withMessage('At least one activity must be provided')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const waiver = await Waiver_1.default.findOne({
            _id: req.params.id,
            $or: [
                { userId: req.user.id },
                { 'participantInfo.email': req.user.email }
            ],
            status: 'active',
            expiresAt: { $gt: new Date() }
        });
        if (!waiver) {
            return res.status(404).json({ error: 'Valid waiver not found' });
        }
        const newActivities = [...new Set([...waiver.activities, ...req.body.activities])];
        waiver.activities = newActivities;
        await waiver.save();
        res.json({
            message: 'Activities updated successfully',
            activities: waiver.activities
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating waiver activities' });
    }
});
router.get('/admin/all', auth_1.protect, (0, auth_1.authorize)('admin'), [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('status').optional().isIn(['active', 'expired', 'revoked']),
    (0, express_validator_1.query)('isMinor').optional().isBoolean(),
    (0, express_validator_1.query)('search').optional().isString()
], async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { status, isMinor, search } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (isMinor !== undefined)
            filter.isMinor = isMinor === 'true';
        if (search) {
            filter.$or = [
                { 'participantInfo.name': { $regex: search, $options: 'i' } },
                { 'participantInfo.email': { $regex: search, $options: 'i' } },
                { 'participantInfo.phone': { $regex: search, $options: 'i' } }
            ];
        }
        const waivers = await Waiver_1.default.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('userId', 'name email');
        const total = await Waiver_1.default.countDocuments(filter);
        const stats = await Waiver_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    totalWaivers: { $sum: 1 },
                    activeWaivers: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$status', 'active'] },
                                        { $gt: ['$expiresAt', new Date()] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    minorWaivers: {
                        $sum: { $cond: ['$isMinor', 1, 0] }
                    },
                    expiredWaivers: {
                        $sum: {
                            $cond: [
                                { $lt: ['$expiresAt', new Date()] },
                                1,
                                0
                            ]
                        }
                    },
                    activitiesBreakdown: {
                        $push: '$activities'
                    }
                }
            }
        ]);
        res.json({
            waivers,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
            stats: stats[0] || {
                totalWaivers: 0,
                activeWaivers: 0,
                minorWaivers: 0,
                expiredWaivers: 0,
                activitiesBreakdown: []
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching waivers' });
    }
});
router.put('/admin/:id/status', auth_1.protect, (0, auth_1.authorize)('admin'), [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.body)('status').isIn(['active', 'expired', 'revoked']).withMessage('Invalid status')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const waiver = await Waiver_1.default.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        if (!waiver) {
            return res.status(404).json({ error: 'Waiver not found' });
        }
        if (req.body.status === 'revoked') {
            await emailService_1.EmailService.sendEmail({
                to: waiver.participantInfo.email,
                subject: 'Waiver Status Update - Paintball 2 Go',
                text: 'Your waiver has been revoked. Please contact us for more information.',
                html: '<h1>Waiver Status Update</h1><p>Your waiver has been revoked. Please contact us for more information.</p>'
            });
        }
        res.json(waiver);
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating waiver status' });
    }
});
router.get('/admin/:id', auth_1.protect, (0, auth_1.authorize)('admin'), (0, express_validator_1.param)('id').isMongoId(), async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const waiver = await Waiver_1.default.findById(req.params.id)
            .populate('userId', 'name email')
            .populate('bookingIds');
        if (!waiver) {
            return res.status(404).json({ error: 'Waiver not found' });
        }
        res.json(waiver);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching waiver' });
    }
});
exports.default = router;
//# sourceMappingURL=waiver.js.map