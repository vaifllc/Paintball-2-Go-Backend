const FAQ = require('../models/FAQ');
const { validationResult } = require('express-validator');

class FAQController {
  // Get all FAQs (public)
  static async getAllFAQs(req, res) {
    try {
      const { category, search, page = 1, limit = 50 } = req.query;

      let query = { isActive: true };

      // Filter by category if provided
      if (category) {
        query.category = category;
      }

      let faqs;

      // Search in questions and answers if search term provided
      if (search) {
        faqs = await FAQ.search(search);
      } else {
        faqs = await FAQ.find(query)
          .sort({ order: 1, createdAt: 1 })
          .limit(parseInt(limit))
          .skip((parseInt(page) - 1) * parseInt(limit));
      }

      const total = await FAQ.countDocuments(query);

      res.json({
        success: true,
        count: faqs.length,
        total,
        data: faqs
      });
    } catch (error) {
      console.error('Get FAQs error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get FAQs by category
  static async getFAQsByCategory(req, res) {
    try {
      const { category } = req.params;

      const faqs = await FAQ.getByCategory(category);

      res.json({
        success: true,
        count: faqs.length,
        data: faqs
      });
    } catch (error) {
      console.error('Get FAQs by category error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get single FAQ
  static async getFAQ(req, res) {
    try {
      const faq = await FAQ.findById(req.params.id);

      if (!faq) {
        return res.status(404).json({
          success: false,
          message: 'FAQ not found'
        });
      }

      // Increment view count
      await faq.incrementViews();

      res.json({
        success: true,
        data: faq
      });
    } catch (error) {
      console.error('Get FAQ error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Create FAQ (admin only)
  static async createFAQ(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const faqData = {
        ...req.body,
        updatedBy: req.user.id
      };

      const faq = new FAQ(faqData);
      await faq.save();

      res.status(201).json({
        success: true,
        message: 'FAQ created successfully',
        data: faq
      });
    } catch (error) {
      console.error('Create FAQ error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Update FAQ (admin only)
  static async updateFAQ(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const updateData = {
        ...req.body,
        updatedBy: req.user.id,
        lastUpdated: new Date()
      };

      const faq = await FAQ.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!faq) {
        return res.status(404).json({
          success: false,
          message: 'FAQ not found'
        });
      }

      res.json({
        success: true,
        message: 'FAQ updated successfully',
        data: faq
      });
    } catch (error) {
      console.error('Update FAQ error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Delete FAQ (admin only)
  static async deleteFAQ(req, res) {
    try {
      const faq = await FAQ.findByIdAndDelete(req.params.id);

      if (!faq) {
        return res.status(404).json({
          success: false,
          message: 'FAQ not found'
        });
      }

      res.json({
        success: true,
        message: 'FAQ deleted successfully'
      });
    } catch (error) {
      console.error('Delete FAQ error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Mark FAQ as helpful/not helpful
  static async markHelpful(req, res) {
    try {
      const { helpful } = req.body;

      if (typeof helpful !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'helpful field must be a boolean'
        });
      }

      const faq = await FAQ.findById(req.params.id);

      if (!faq) {
        return res.status(404).json({
          success: false,
          message: 'FAQ not found'
        });
      }

      await faq.markHelpful(helpful);

      res.json({
        success: true,
        message: 'Thank you for your feedback',
        data: {
          helpful: faq.helpful,
          helpfulnessRatio: faq.helpfulnessRatio
        }
      });
    } catch (error) {
      console.error('Mark helpful error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get FAQ categories
  static async getCategories(req, res) {
    try {
      const categories = await FAQ.distinct('category', { isActive: true });

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get popular FAQs (most viewed)
  static async getPopularFAQs(req, res) {
    try {
      const { limit = 10 } = req.query;

      const faqs = await FAQ.find({ isActive: true })
        .sort({ views: -1 })
        .limit(parseInt(limit));

      res.json({
        success: true,
        count: faqs.length,
        data: faqs
      });
    } catch (error) {
      console.error('Get popular FAQs error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get recently added FAQs
  static async getRecentFAQs(req, res) {
    try {
      const { limit = 10 } = req.query;

      const faqs = await FAQ.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      res.json({
        success: true,
        count: faqs.length,
        data: faqs
      });
    } catch (error) {
      console.error('Get recent FAQs error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = FAQController;
