"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const ContentBlock_1 = __importDefault(require("../models/ContentBlock"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/content', async (req, res) => {
    try {
        const { section, type, status = 'published' } = req.query;
        const filter = { status };
        if (section)
            filter.section = section;
        if (type)
            filter.type = type;
        const content = await ContentBlock_1.default.find(filter).sort({ lastModified: -1 });
        res.json({
            success: true,
            data: content
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching content'
        });
    }
});
router.get('/content/:id', async (req, res) => {
    try {
        const content = await ContentBlock_1.default.findOne({
            id: req.params.id,
            status: 'published'
        });
        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }
        res.json({
            success: true,
            data: content
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching content'
        });
    }
});
router.get('/admin/content', auth_1.protect, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const { section, type, status } = req.query;
        const filter = {};
        if (section)
            filter.section = section;
        if (type)
            filter.type = type;
        if (status)
            filter.status = status;
        const content = await ContentBlock_1.default.find(filter).sort({ lastModified: -1 });
        res.json({
            success: true,
            data: content
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching content'
        });
    }
});
router.post('/admin/content', auth_1.protect, (0, auth_1.authorize)('admin'), [
    (0, express_validator_1.body)('id').notEmpty().withMessage('Content ID is required'),
    (0, express_validator_1.body)('section').notEmpty().withMessage('Section is required'),
    (0, express_validator_1.body)('type').notEmpty().withMessage('Type is required'),
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('content').notEmpty().withMessage('Content is required'),
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
        const { id, section, type, title, content, metadata, status = 'draft' } = req.body;
        const existingContent = await ContentBlock_1.default.findOne({ id });
        if (existingContent) {
            return res.status(400).json({
                success: false,
                message: 'Content with this ID already exists'
            });
        }
        const newContent = await ContentBlock_1.default.create({
            id,
            section,
            type,
            title,
            content,
            metadata,
            status,
            author: req.user?.name || 'Admin'
        });
        const io = req.app.get('io');
        io.emit('cms-updated', {
            action: 'create',
            data: newContent
        });
        res.status(201).json({
            success: true,
            data: newContent
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating content'
        });
    }
});
router.put('/admin/content/:id', auth_1.protect, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const { section, type, title, content, metadata, status } = req.body;
        const existingContent = await ContentBlock_1.default.findOne({ id: req.params.id });
        if (!existingContent) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }
        const updatedContent = await ContentBlock_1.default.findOneAndUpdate({ id: req.params.id }, {
            section: section || existingContent.section,
            type: type || existingContent.type,
            title: title || existingContent.title,
            content: content || existingContent.content,
            metadata: metadata || existingContent.metadata,
            status: status || existingContent.status,
            lastModified: new Date(),
            author: req.user?.name || 'Admin',
            version: existingContent.version + 1
        }, { new: true, runValidators: true });
        const io = req.app.get('io');
        io.emit('cms-updated', {
            action: 'update',
            data: updatedContent
        });
        res.json({
            success: true,
            data: updatedContent
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating content'
        });
    }
});
router.delete('/admin/content/:id', auth_1.protect, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const content = await ContentBlock_1.default.findOneAndDelete({ id: req.params.id });
        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }
        const io = req.app.get('io');
        io.emit('cms-updated', {
            action: 'delete',
            data: { id: req.params.id }
        });
        res.json({
            success: true,
            message: 'Content deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting content'
        });
    }
});
router.get('/section/:section', async (req, res) => {
    try {
        const content = await ContentBlock_1.default.find({
            section: req.params.section,
            status: 'published'
        }).sort({ lastModified: -1 });
        res.json({
            success: true,
            data: content
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching content'
        });
    }
});
exports.default = router;
//# sourceMappingURL=cms.js.map