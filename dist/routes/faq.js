"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const FAQ_1 = __importDefault(require("../models/FAQ"));
const router = express_1.default.Router();
router.get('/', [
    (0, express_validator_1.query)('category').optional().isString(),
    (0, express_validator_1.query)('search').optional().isString()
], async (req, res) => {
    try {
        const { category, search } = req.query;
        const filter = { isActive: true };
        if (category) {
            filter.category = category;
        }
        if (search) {
            filter.$or = [
                { question: { $regex: search, $options: 'i' } },
                { answer: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        const faqs = await FAQ_1.default.find(filter)
            .sort({ order: 1, createdAt: 1 })
            .select('-views -helpful -notHelpful -lastModified -modifiedBy');
        const categories = await FAQ_1.default.distinct('category', { isActive: true });
        res.json({ faqs, categories });
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching FAQs' });
    }
});
router.get('/:id', (0, express_validator_1.param)('id').isMongoId(), async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const faq = await FAQ_1.default.findOneAndUpdate({ _id: req.params.id, isActive: true }, { $inc: { views: 1 } }, { new: true }).select('-helpful -notHelpful -lastModified -modifiedBy');
        if (!faq) {
            return res.status(404).json({ error: 'FAQ not found' });
        }
        res.json(faq);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching FAQ' });
    }
});
router.post('/:id/rate', [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.body)('helpful').isBoolean().withMessage('Helpful must be a boolean')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const updateField = req.body.helpful ? 'helpful' : 'notHelpful';
        const faq = await FAQ_1.default.findOneAndUpdate({ _id: req.params.id, isActive: true }, { $inc: { [updateField]: 1 } }, { new: true });
        if (!faq) {
            return res.status(404).json({ error: 'FAQ not found' });
        }
        res.json({ message: 'Rating recorded successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error rating FAQ' });
    }
});
router.get('/admin/all', auth_1.protect, (0, auth_1.authorize)('admin'), [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('category').optional().isString(),
    (0, express_validator_1.query)('isActive').optional().isBoolean()
], async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { category, isActive } = req.query;
        const filter = {};
        if (category)
            filter.category = category;
        if (isActive !== undefined)
            filter.isActive = isActive === 'true';
        const faqs = await FAQ_1.default.find(filter)
            .sort({ order: 1, createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('modifiedBy', 'name email');
        const total = await FAQ_1.default.countDocuments(filter);
        const stats = await FAQ_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    totalFAQs: { $sum: 1 },
                    activeFAQs: {
                        $sum: { $cond: ['$isActive', 1, 0] }
                    },
                    totalViews: { $sum: '$views' },
                    totalHelpful: { $sum: '$helpful' },
                    totalNotHelpful: { $sum: '$notHelpful' },
                    categories: { $addToSet: '$category' }
                }
            }
        ]);
        res.json({
            faqs,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
            stats: stats[0] || {
                totalFAQs: 0,
                activeFAQs: 0,
                totalViews: 0,
                totalHelpful: 0,
                totalNotHelpful: 0,
                categories: []
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching FAQs' });
    }
});
router.post('/admin/create', auth_1.protect, (0, auth_1.authorize)('admin'), [
    (0, express_validator_1.body)('question').notEmpty().withMessage('Question is required').isLength({ max: 500 }),
    (0, express_validator_1.body)('answer').notEmpty().withMessage('Answer is required').isLength({ max: 2000 }),
    (0, express_validator_1.body)('category').notEmpty().withMessage('Category is required'),
    (0, express_validator_1.body)('order').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('tags').optional().isArray(),
    (0, express_validator_1.body)('isActive').optional().isBoolean()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const faq = new FAQ_1.default({
            ...req.body,
            modifiedBy: req.user.id
        });
        await faq.save();
        res.status(201).json(faq);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating FAQ' });
    }
});
router.put('/admin/:id', auth_1.protect, (0, auth_1.authorize)('admin'), [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.body)('question').optional().notEmpty().isLength({ max: 500 }),
    (0, express_validator_1.body)('answer').optional().notEmpty().isLength({ max: 2000 }),
    (0, express_validator_1.body)('category').optional().notEmpty(),
    (0, express_validator_1.body)('order').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('tags').optional().isArray(),
    (0, express_validator_1.body)('isActive').optional().isBoolean()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const faq = await FAQ_1.default.findByIdAndUpdate(req.params.id, {
            ...req.body,
            modifiedBy: req.user.id
        }, { new: true });
        if (!faq) {
            return res.status(404).json({ error: 'FAQ not found' });
        }
        res.json(faq);
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating FAQ' });
    }
});
router.delete('/admin/:id', auth_1.protect, (0, auth_1.authorize)('admin'), (0, express_validator_1.param)('id').isMongoId(), async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const faq = await FAQ_1.default.findByIdAndDelete(req.params.id);
        if (!faq) {
            return res.status(404).json({ error: 'FAQ not found' });
        }
        res.json({ message: 'FAQ deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error deleting FAQ' });
    }
});
router.post('/admin/reorder', auth_1.protect, (0, auth_1.authorize)('admin'), [
    (0, express_validator_1.body)('faqs').isArray().withMessage('FAQs must be an array'),
    (0, express_validator_1.body)('faqs.*.id').isMongoId().withMessage('Invalid FAQ ID'),
    (0, express_validator_1.body)('faqs.*.order').isInt({ min: 0 }).withMessage('Order must be a positive integer')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { faqs } = req.body;
        const updatePromises = faqs.map((faq) => FAQ_1.default.findByIdAndUpdate(faq.id, {
            order: faq.order,
            modifiedBy: req.user.id
        }));
        await Promise.all(updatePromises);
        res.json({ message: 'FAQs reordered successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error reordering FAQs' });
    }
});
exports.default = router;
//# sourceMappingURL=faq.js.map