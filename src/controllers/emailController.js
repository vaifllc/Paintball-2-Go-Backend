const { EmailService } = require('../services/emailService');
const EmailTemplate = require('../models/EmailTemplate');
const EmailCampaign = require('../models/EmailCampaign');
const User = require('../models/User');
const { validationResult } = require('express-validator');

class EmailController {
  // Send test email
  static async sendTestEmail(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { to, subject, html } = req.body;

      const result = await EmailService.sendEmail(to, subject, html);

      if (result.success) {
        res.json({
          success: true,
          message: 'Test email sent successfully',
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to send test email',
          error: result.error
        });
      }
    } catch (error) {
      console.error('Send test email error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Send bulk email
  static async sendBulkEmail(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { recipients, subject, html, templateId, variables } = req.body;

      let emailContent = html;

      // Use template if provided
      if (templateId) {
        const template = await EmailTemplate.findById(templateId);
        if (!template) {
          return res.status(404).json({
            success: false,
            message: 'Email template not found'
          });
        }

        emailContent = template.content;

        // Replace variables in template
        if (variables) {
          Object.keys(variables).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            emailContent = emailContent.replace(regex, variables[key]);
          });
        }
      }

      const result = await EmailService.sendBulkEmail(recipients, subject, emailContent);

      res.json({
        success: true,
        message: 'Bulk email sent',
        data: result
      });
    } catch (error) {
      console.error('Send bulk email error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Create email campaign
  static async createCampaign(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const campaignData = {
        ...req.body,
        createdBy: req.user.id
      };

      const campaign = new EmailCampaign(campaignData);
      await campaign.save();

      res.status(201).json({
        success: true,
        message: 'Email campaign created successfully',
        data: campaign
      });
    } catch (error) {
      console.error('Create campaign error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Send campaign
  static async sendCampaign(req, res) {
    try {
      const { id } = req.params;

      const result = await EmailService.sendCampaign(id);

      if (result.success) {
        res.json({
          success: true,
          message: 'Campaign sent successfully',
          data: result
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to send campaign',
          error: result.error
        });
      }
    } catch (error) {
      console.error('Send campaign error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get all campaigns
  static async getCampaigns(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;

      let query = {};
      if (status) {
        query.status = status;
      }

      const campaigns = await EmailCampaign.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await EmailCampaign.countDocuments(query);

      res.json({
        success: true,
        count: campaigns.length,
        total,
        data: campaigns
      });
    } catch (error) {
      console.error('Get campaigns error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get single campaign
  static async getCampaign(req, res) {
    try {
      const campaign = await EmailCampaign.findById(req.params.id)
        .populate('createdBy', 'name email');

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      res.json({
        success: true,
        data: campaign
      });
    } catch (error) {
      console.error('Get campaign error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get email templates
  static async getTemplates(req, res) {
    try {
      const { page = 1, limit = 10, type, active } = req.query;

      let query = {};
      if (type) {
        query.type = type;
      }
      if (active !== undefined) {
        query.isActive = active === 'true';
      }

      const templates = await EmailTemplate.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await EmailTemplate.countDocuments(query);

      res.json({
        success: true,
        count: templates.length,
        total,
        data: templates
      });
    } catch (error) {
      console.error('Get templates error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Create email template
  static async createTemplate(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const template = new EmailTemplate(req.body);
      await template.save();

      res.status(201).json({
        success: true,
        message: 'Email template created successfully',
        data: template
      });
    } catch (error) {
      console.error('Create template error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Update email template
  static async updateTemplate(req, res) {
    try {
      const template = await EmailTemplate.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      res.json({
        success: true,
        message: 'Template updated successfully',
        data: template
      });
    } catch (error) {
      console.error('Update template error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Delete email template
  static async deleteTemplate(req, res) {
    try {
      const template = await EmailTemplate.findByIdAndDelete(req.params.id);

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
    } catch (error) {
      console.error('Delete template error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get subscriber list
  static async getSubscribers(req, res) {
    try {
      const { type = 'newsletter' } = req.query;

      let query = { isActive: true };
      query[`subscriptions.${type}`] = true;

      const subscribers = await User.find(query, 'name email subscriptions');

      res.json({
        success: true,
        count: subscribers.length,
        data: subscribers
      });
    } catch (error) {
      console.error('Get subscribers error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Newsletter signup
  static async newsletterSignup(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { email, name } = req.body;

      // Check if user already exists
      let user = await User.findOne({ email });

      if (user) {
        // Update subscription preferences
        user.subscriptions.newsletter = true;
        await user.save();
      } else {
        // Create new user with newsletter subscription
        user = new User({
          name: name || 'Newsletter Subscriber',
          email,
          subscriptions: {
            newsletter: true,
            marketing: false,
            transactional: true
          }
        });
        await user.save();
      }

      res.json({
        success: true,
        message: 'Successfully subscribed to newsletter'
      });
    } catch (error) {
      console.error('Newsletter signup error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = EmailController;
