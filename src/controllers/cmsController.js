const ContentBlock = require('../models/ContentBlock');
const { validationResult } = require('express-validator');

class CMSController {
  // Get all content blocks
  static async getAllContent(req, res) {
    try {
      const { section, type, status, page = 1, limit = 50 } = req.query;

      let query = {};

      if (section) {
        query.section = section;
      }

      if (type) {
        query.type = type;
      }

      if (status) {
        query.status = status;
      } else {
        // Default to published content for non-admin users
        if (!req.user || req.user.role !== 'admin') {
          query.status = 'published';
        }
      }

      const content = await ContentBlock.find(query)
        .sort({ section: 1, createdAt: 1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await ContentBlock.countDocuments(query);

      // Transform content into organized structure
      const organizedContent = {};
      content.forEach(block => {
        if (!organizedContent[block.section]) {
          organizedContent[block.section] = {};
        }

        try {
          organizedContent[block.section][block.id] = {
            id: block.id,
            title: block.title,
            type: block.type,
            content: typeof block.content === 'string' ? JSON.parse(block.content) : block.content,
            status: block.status,
            version: block.version,
            publishedAt: block.publishedAt,
            updatedAt: block.updatedAt
          };
        } catch (parseError) {
          // If content is not valid JSON, store as-is
          organizedContent[block.section][block.id] = {
            id: block.id,
            title: block.title,
            type: block.type,
            content: block.content,
            status: block.status,
            version: block.version,
            publishedAt: block.publishedAt,
            updatedAt: block.updatedAt
          };
        }
      });

      res.json({
        success: true,
        count: content.length,
        total,
        data: organizedContent
      });
    } catch (error) {
      console.error('Get all content error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get content by section
  static async getContentBySection(req, res) {
    try {
      const { section } = req.params;
      const { status } = req.query;

      let query = { section };

      if (status) {
        query.status = status;
      } else {
        // Default to published content for non-admin users
        if (!req.user || req.user.role !== 'admin') {
          query.status = 'published';
        }
      }

      const content = await ContentBlock.find(query)
        .sort({ createdAt: 1 });

      const sectionContent = {};
      content.forEach(block => {
        try {
          sectionContent[block.id] = {
            id: block.id,
            title: block.title,
            type: block.type,
            content: typeof block.content === 'string' ? JSON.parse(block.content) : block.content,
            status: block.status,
            version: block.version,
            publishedAt: block.publishedAt,
            updatedAt: block.updatedAt
          };
        } catch (parseError) {
          sectionContent[block.id] = {
            id: block.id,
            title: block.title,
            type: block.type,
            content: block.content,
            status: block.status,
            version: block.version,
            publishedAt: block.publishedAt,
            updatedAt: block.updatedAt
          };
        }
      });

      res.json({
        success: true,
        section,
        count: content.length,
        data: sectionContent
      });
    } catch (error) {
      console.error('Get content by section error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get single content block
  static async getContentBlock(req, res) {
    try {
      const { id } = req.params;

      const contentBlock = await ContentBlock.findOne({ id });

      if (!contentBlock) {
        return res.status(404).json({
          success: false,
          message: 'Content block not found'
        });
      }

      // Check if user can access this content
      if (contentBlock.status !== 'published' && (!req.user || req.user.role !== 'admin')) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      try {
        const parsedContent = typeof contentBlock.content === 'string' ?
          JSON.parse(contentBlock.content) : contentBlock.content;

        res.json({
          success: true,
          data: {
            id: contentBlock.id,
            section: contentBlock.section,
            title: contentBlock.title,
            type: contentBlock.type,
            content: parsedContent,
            status: contentBlock.status,
            version: contentBlock.version,
            publishedAt: contentBlock.publishedAt,
            updatedAt: contentBlock.updatedAt
          }
        });
      } catch (parseError) {
        res.json({
          success: true,
          data: contentBlock
        });
      }
    } catch (error) {
      console.error('Get content block error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Create content block (admin only)
  static async createContentBlock(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      // Check if content block with this ID already exists
      const existingBlock = await ContentBlock.findOne({ id: req.body.id });
      if (existingBlock) {
        return res.status(400).json({
          success: false,
          message: 'Content block with this ID already exists'
        });
      }

      const contentData = {
        ...req.body,
        content: typeof req.body.content === 'object' ?
          JSON.stringify(req.body.content) : req.body.content
      };

      const contentBlock = new ContentBlock(contentData);
      await contentBlock.save();

      // Broadcast content update via Socket.IO
      if (req.app.get('io')) {
        req.app.get('io').emit('cms-updated', {
          action: 'create',
          section: contentBlock.section,
          id: contentBlock.id,
          data: contentBlock
        });
      }

      res.status(201).json({
        success: true,
        message: 'Content block created successfully',
        data: contentBlock
      });
    } catch (error) {
      console.error('Create content block error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Update content block (admin only)
  static async updateContentBlock(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { id } = req.params;

      const updateData = {
        ...req.body,
        content: typeof req.body.content === 'object' ?
          JSON.stringify(req.body.content) : req.body.content
      };

      // Increment version if content is being published
      if (updateData.status === 'published') {
        updateData.publishedAt = new Date();
        updateData.version = (await ContentBlock.findOne({ id }))?.version + 1 || 1;
      }

      const contentBlock = await ContentBlock.findOneAndUpdate(
        { id },
        updateData,
        { new: true, runValidators: true }
      );

      if (!contentBlock) {
        return res.status(404).json({
          success: false,
          message: 'Content block not found'
        });
      }

      // Broadcast content update via Socket.IO
      if (req.app.get('io')) {
        req.app.get('io').emit('cms-updated', {
          action: 'update',
          section: contentBlock.section,
          id: contentBlock.id,
          data: contentBlock
        });
      }

      res.json({
        success: true,
        message: 'Content block updated successfully',
        data: contentBlock
      });
    } catch (error) {
      console.error('Update content block error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Delete content block (admin only)
  static async deleteContentBlock(req, res) {
    try {
      const { id } = req.params;

      const contentBlock = await ContentBlock.findOneAndDelete({ id });

      if (!contentBlock) {
        return res.status(404).json({
          success: false,
          message: 'Content block not found'
        });
      }

      // Broadcast content update via Socket.IO
      if (req.app.get('io')) {
        req.app.get('io').emit('cms-updated', {
          action: 'delete',
          section: contentBlock.section,
          id: contentBlock.id
        });
      }

      res.json({
        success: true,
        message: 'Content block deleted successfully'
      });
    } catch (error) {
      console.error('Delete content block error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Publish content block (admin only)
  static async publishContentBlock(req, res) {
    try {
      const { id } = req.params;

      const contentBlock = await ContentBlock.findOneAndUpdate(
        { id },
        {
          status: 'published',
          publishedAt: new Date(),
          $inc: { version: 1 }
        },
        { new: true }
      );

      if (!contentBlock) {
        return res.status(404).json({
          success: false,
          message: 'Content block not found'
        });
      }

      // Broadcast content update via Socket.IO
      if (req.app.get('io')) {
        req.app.get('io').emit('cms-updated', {
          action: 'publish',
          section: contentBlock.section,
          id: contentBlock.id,
          data: contentBlock
        });
      }

      res.json({
        success: true,
        message: 'Content block published successfully',
        data: contentBlock
      });
    } catch (error) {
      console.error('Publish content block error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get all sections
  static async getSections(req, res) {
    try {
      const sections = await ContentBlock.distinct('section');

      res.json({
        success: true,
        data: sections
      });
    } catch (error) {
      console.error('Get sections error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = CMSController;
