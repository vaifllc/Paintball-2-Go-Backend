"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const resend_1 = require("resend");
const User_1 = __importDefault(require("../models/User"));
const EmailTemplate_1 = __importDefault(require("../models/EmailTemplate"));
const EmailCampaign_1 = __importDefault(require("../models/EmailCampaign"));
const emailTemplates_1 = require("../utils/emailTemplates");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
class EmailService {
    static async sendEmail(to, subject, html) {
        try {
            const data = await resend.emails.send({
                from: 'Paintball 2 Go <noreply@paintball2go.com>',
                to: [to],
                subject,
                html,
            });
            return { success: true, data };
        }
        catch (error) {
            console.error('Email sending error:', error);
            return { success: false, error };
        }
    }
    static async sendBulkEmail(recipients, subject, html) {
        try {
            const promises = recipients.map(email => this.sendEmail(email, subject, html));
            const results = await Promise.allSettled(promises);
            const successful = results.filter(result => result.status === 'fulfilled' && result.value.success).length;
            const failed = results.length - successful;
            return {
                success: true,
                totalSent: recipients.length,
                successful,
                failed,
                results
            };
        }
        catch (error) {
            console.error('Bulk email sending error:', error);
            return { success: false, error };
        }
    }
    static async sendCampaign(campaignId) {
        try {
            const campaign = await EmailCampaign_1.default.findById(campaignId)
                .populate('templateId')
                .populate('createdBy');
            if (!campaign) {
                throw new Error('Campaign not found');
            }
            const template = await EmailTemplate_1.default.findById(campaign.templateId);
            if (!template) {
                throw new Error('Template not found');
            }
            let recipients = [];
            if (campaign.recipientFilter.type === 'all') {
                recipients = await User_1.default.find({
                    isActive: true,
                    'subscriptions.marketing': true
                });
            }
            else if (campaign.recipientFilter.type === 'selected') {
                recipients = await User_1.default.find({
                    _id: { $in: campaign.recipientFilter.selectedUsers },
                    isActive: true
                });
            }
            else if (campaign.recipientFilter.type === 'tag') {
                recipients = await User_1.default.find({
                    tags: { $in: campaign.recipientFilter.tags },
                    isActive: true,
                    'subscriptions.marketing': true
                });
            }
            if (recipients.length === 0) {
                throw new Error('No recipients found');
            }
            campaign.status = 'sending';
            campaign.recipientCount = recipients.length;
            await campaign.save();
            const recipientEmails = recipients.map(user => user.email);
            const result = await this.sendBulkEmail(recipientEmails, campaign.subject, template.content);
            campaign.status = 'sent';
            campaign.sentAt = new Date();
            campaign.deliveredCount = result.successful || 0;
            campaign.failedCount = result.failed || 0;
            template.lastUsed = new Date();
            template.usageCount += 1;
            await template.save();
            await campaign.save();
            return {
                success: true,
                campaign,
                result
            };
        }
        catch (error) {
            await EmailCampaign_1.default.findByIdAndUpdate(campaignId, {
                status: 'failed'
            });
            console.error('Campaign sending error:', error);
            return { success: false, error };
        }
    }
    static async sendWelcomeEmail(userEmail, userName) {
        const template = emailTemplates_1.EmailTemplates.welcome(userName);
        return await this.sendEmail(userEmail, template.subject, template.html);
    }
    static async sendPasswordResetEmail(userEmail, userName, resetToken) {
        const template = emailTemplates_1.EmailTemplates.passwordReset(userName, resetToken);
        return await this.sendEmail(userEmail, template.subject, template.html);
    }
    static async sendBookingConfirmation(bookingDetails) {
        const template = emailTemplates_1.EmailTemplates.bookingConfirmation(bookingDetails);
        return await this.sendEmail(bookingDetails.customerInfo.email, template.subject, template.html);
    }
    static async sendPaymentConfirmation(paymentDetails, userEmail) {
        const template = emailTemplates_1.EmailTemplates.paymentConfirmation(paymentDetails);
        return await this.sendEmail(userEmail, template.subject, template.html);
    }
    static async sendWaiverConfirmation(waiverDetails) {
        const template = emailTemplates_1.EmailTemplates.waiverConfirmation(waiverDetails);
        return await this.sendEmail(waiverDetails.participantInfo.email, template.subject, template.html);
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=emailService.js.map