"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const EmailTemplate_1 = __importDefault(require("../models/EmailTemplate"));
const EmailCampaign_1 = __importDefault(require("../models/EmailCampaign"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const emailService_1 = require("../services/emailService");
const router = express_1.default.Router();
router.get('/templates', auth_1.protect, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const { type, isActive } = req.query;
        const filter = {};
        if (type)
            filter.type = type;
        if (isActive !== undefined)
            filter.isActive = isActive === 'true';
        const templates = await EmailTemplate_1.default.find(filter)
            .populate('createdBy', 'name email')
            .sort({ updatedAt: -1 });
        res.json({
            success: true,
            data: templates
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching templates'
        });
    }
});
router.post('/templates', auth_1.protect, (0, auth_1.authorize)('admin'), [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Template name is required'),
    (0, express_validator_1.body)('subject').notEmpty().withMessage('Subject is required'),
    (0, express_validator_1.body)('content').notEmpty().withMessage('Content is required'),
    (0, express_validator_1.body)('type').isIn(['marketing', 'transactional', 'newsletter']).withMessage('Invalid template type')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }
        const { name, subject, content, type, variables } = req.body;
        const template = await EmailTemplate_1.default.create({
            name,
            subject,
            content,
            type,
            variables: variables || [],
            createdBy: req.user?._id
        });
        await template.populate('createdBy', 'name email');
        res.status(201).json({
            success: true,
            data: template
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating template'
        });
    }
});
router.put('/templates/:id', auth_1.protect, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const { name, subject, content, type, isActive, variables } = req.body;
        const template = await EmailTemplate_1.default.findByIdAndUpdate(req.params.id, {
            ...(name && { name }),
            ...(subject && { subject }),
            ...(content && { content }),
            ...(type && { type }),
            ...(isActive !== undefined && { isActive }),
            ...(variables && { variables })
        }, { new: true, runValidators: true }).populate('createdBy', 'name email');
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }
        res.json({
            success: true,
            data: template
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating template'
        });
    }
});
router.delete('/templates/:id', auth_1.protect, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const template = await EmailTemplate_1.default.findByIdAndDelete(req.params.id);
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }
        res.json({
            success: true,
            message: 'Template deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting template'
        });
    }
});
router.get('/campaigns', auth_1.protect, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        const campaigns = await EmailCampaign_1.default.find(filter)
            .populate('templateId', 'name subject type')
            .populate('createdBy', 'name email')
            .sort({ updatedAt: -1 });
        res.json({
            success: true,
            data: campaigns
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching campaigns'
        });
    }
});
router.post('/campaigns', auth_1.protect, (0, auth_1.authorize)('admin'), [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Campaign name is required'),
    (0, express_validator_1.body)('subject').notEmpty().withMessage('Subject is required'),
    (0, express_validator_1.body)('templateId').notEmpty().withMessage('Template is required'),
    (0, express_validator_1.body)('recipientFilter.type').isIn(['all', 'selected', 'tag']).withMessage('Invalid recipient filter type')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }
        const { name, subject, templateId, recipientFilter, scheduledAt } = req.body;
        const template = await EmailTemplate_1.default.findById(templateId);
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }
        const campaign = await EmailCampaign_1.default.create({
            name,
            subject,
            templateId,
            recipientFilter,
            status: scheduledAt ? 'scheduled' : 'draft',
            scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
            createdBy: req.user?._id
        });
        await campaign.populate([
            { path: 'templateId', select: 'name subject type' },
            { path: 'createdBy', select: 'name email' }
        ]);
        res.status(201).json({
            success: true,
            data: campaign
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating campaign'
        });
    }
});
router.post('/campaigns/:id/send', auth_1.protect, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const result = await emailService_1.EmailService.sendCampaign(req.params.id);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to send campaign',
                error: result.error
            });
        }
        res.json({
            success: true,
            message: 'Campaign sent successfully',
            data: result.campaign
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error sending campaign'
        });
    }
});
router.get('/recipients', auth_1.protect, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const { subscribed, tags } = req.query;
        const filter = { isActive: true };
        if (subscribed !== undefined) {
            filter['subscriptions.marketing'] = subscribed === 'true';
        }
        if (tags) {
            filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
        }
        const recipients = await User_1.default.find(filter)
            .select('name email tags subscriptions createdAt')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            data: recipients
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching recipients'
        });
    }
});
router.put('/recipients/:id/subscriptions', auth_1.protect, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const { subscriptions } = req.body;
        const user = await User_1.default.findByIdAndUpdate(req.params.id, { subscriptions }, { new: true, runValidators: true }).select('name email subscriptions');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Recipient not found'
            });
        }
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating subscriptions'
        });
    }
});
router.get('/analytics', auth_1.protect, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const totalRecipients = await User_1.default.countDocuments({ isActive: true });
        const subscribedRecipients = await User_1.default.countDocuments({
            isActive: true,
            'subscriptions.marketing': true
        });
        const campaigns = await EmailCampaign_1.default.find().sort({ createdAt: -1 }).limit(10);
        const totalCampaigns = await EmailCampaign_1.default.countDocuments();
        const sentCampaigns = await EmailCampaign_1.default.countDocuments({ status: 'sent' });
        const avgOpenRate = await EmailCampaign_1.default.aggregate([
            { $match: { status: 'sent', openRate: { $gt: 0 } } },
            { $group: { _id: null, avgOpenRate: { $avg: '$openRate' } } }
        ]);
        const avgClickRate = await EmailCampaign_1.default.aggregate([
            { $match: { status: 'sent', clickRate: { $gt: 0 } } },
            { $group: { _id: null, avgClickRate: { $avg: '$clickRate' } } }
        ]);
        res.json({
            success: true,
            data: {
                recipients: {
                    total: totalRecipients,
                    subscribed: subscribedRecipients
                },
                campaigns: {
                    total: totalCampaigns,
                    sent: sentCampaigns,
                    recent: campaigns
                },
                performance: {
                    avgOpenRate: avgOpenRate[0]?.avgOpenRate || 0,
                    avgClickRate: avgClickRate[0]?.avgClickRate || 0
                }
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics'
        });
    }
});
exports.default = router;
//# sourceMappingURL=email.js.map