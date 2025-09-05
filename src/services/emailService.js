const { Resend } = require('resend');
const User = require('../models/User');
const EmailTemplate = require('../models/EmailTemplate');
const EmailCampaign = require('../models/EmailCampaign');
const { EmailTemplates } = require('../utils/emailTemplates');

const resend = new Resend(process.env.RESEND_API_KEY);

class EmailService {
  static async sendEmail(to, subject, html) {
    try {
      const data = await resend.emails.send({
        from: 'Paintball 2 Go <noreply@paintball2go.net>',
        to: [to],
        subject,
        html,
      });

      return { success: true, data };
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, error };
    }
  }

  static async sendBulkEmail(recipients, subject, html) {
    try {
      const promises = recipients.map(email =>
        this.sendEmail(email, subject, html)
      );

      const results = await Promise.allSettled(promises);

      const successful = results.filter(result =>
        result.status === 'fulfilled' && result.value.success
      ).length;

      const failed = results.length - successful;

      return {
        success: true,
        totalSent: recipients.length,
        successful,
        failed,
        results
      };
    } catch (error) {
      console.error('Bulk email sending error:', error);
      return { success: false, error };
    }
  }

  static async sendCampaign(campaignId) {
    try {
      const campaign = await EmailCampaign.findById(campaignId);
      if (!campaign) {
        return { success: false, error: 'Campaign not found' };
      }

      // Determine recipients based on campaign.recipientFilter
      let recipients = [];
      const filter = campaign.recipientFilter || { type: 'all' };

      if (filter.type === 'all') {
        recipients = await User.find({
          isActive: true,
          'subscriptions.newsletter': true
        }).select('email name');
      } else if (filter.type === 'selected' && Array.isArray(filter.selectedUsers) && filter.selectedUsers.length > 0) {
        recipients = await User.find({
          _id: { $in: filter.selectedUsers },
          isActive: true
        }).select('email name');
      } else if (filter.type === 'tag' && Array.isArray(filter.tags) && filter.tags.length > 0) {
        recipients = await User.find({
          isActive: true,
          tags: { $in: filter.tags }
        }).select('email name');
      } else {
        // Fallback to no recipients
        recipients = [];
      }

      // Update campaign status
      campaign.status = 'sending';
      campaign.sentAt = new Date();
      await campaign.save();

      // Send emails
      const emailPromises = recipients.map(user => this.sendEmail(user.email, campaign.subject, campaign.content));

      const results = await Promise.allSettled(emailPromises);

      // Calculate metrics
      const delivered = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.length - delivered;

      // Update campaign with results
      campaign.status = 'sent';
      campaign.deliveredCount = delivered;
      campaign.failedCount = failed;
      campaign.completedAt = new Date();
      await campaign.save();

      const result = await this.sendBulkEmail(
        recipients.map(user => user.email),
        campaign.subject,
        campaign.content
      );

      return {
        success: true,
        campaign,
        result
      };
    } catch (error) {
      // Update campaign status to failed
      await EmailCampaign.findByIdAndUpdate(campaignId, {
        status: 'failed'
      });

      console.error('Campaign sending error:', error);
      return { success: false, error };
    }
  }

  static async sendWelcomeEmail(userEmail, userName) {
    const template = EmailTemplates.welcome(userName);
    return await this.sendEmail(userEmail, template.subject, template.html);
  }

  static async sendPasswordResetEmail(userEmail, userName, resetToken) {
    const template = EmailTemplates.passwordReset(userName, resetToken);
    return await this.sendEmail(userEmail, template.subject, template.html);
  }

  static async sendBookingConfirmation(bookingDetails) {
    const template = EmailTemplates.bookingConfirmation(bookingDetails);
    return await this.sendEmail(bookingDetails.customerInfo.email, template.subject, template.html);
  }

  static async sendPaymentConfirmation(paymentDetails, userEmail) {
    const template = EmailTemplates.paymentConfirmation(paymentDetails);
    return await this.sendEmail(userEmail, template.subject, template.html);
  }

  static async sendWaiverConfirmation(waiverDetails) {
    const template = EmailTemplates.waiverConfirmation(waiverDetails);
    return await this.sendEmail(waiverDetails.participantInfo.email, template.subject, template.html);
  }
}

module.exports = { EmailService };