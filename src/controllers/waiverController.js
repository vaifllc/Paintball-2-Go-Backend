const Waiver = require('../models/Waiver');
const Booking = require('../models/Booking');
const { EmailService } = require('../services/emailService');
const { validationResult } = require('express-validator');

class WaiverController {
  // Get all waivers (admin only)
  static async getAllWaivers(req, res) {
    try {
      const { page = 1, limit = 10, status, eventType, startDate, endDate } = req.query;

      let query = {};

      if (status) {
        query.status = status;
      }

      if (eventType) {
        query.eventType = eventType;
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const waivers = await Waiver.find(query)
        .populate('bookingId', 'eventType eventDate customerInfo')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await Waiver.countDocuments(query);

      res.json({
        success: true,
        count: waivers.length,
        total,
        data: waivers
      });
    } catch (error) {
      console.error('Get all waivers error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get user's waivers
  static async getUserWaivers(req, res) {
    try {
      const waivers = await Waiver.find({ userId: req.user.id })
        .populate('bookingId', 'eventType eventDate')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        count: waivers.length,
        data: waivers
      });
    } catch (error) {
      console.error('Get user waivers error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Submit waiver
  static async submitWaiver(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const waiverData = {
        ...req.body,
        userId: req.user ? req.user.id : null,
        status: 'completed',
        submissionDate: new Date()
      };

      // Validate signatures are present for required participants
      if (waiverData.participants && waiverData.participants.length > 0) {
        const missingSignatures = waiverData.participants.filter(p => !p.signature);
        if (missingSignatures.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'All participants must provide signatures'
          });
        }
      }

      const waiver = new Waiver(waiverData);
      await waiver.save();

      // Update booking with waiver information if booking ID provided
      if (waiverData.bookingId) {
        await Booking.findByIdAndUpdate(waiverData.bookingId, {
          waiverStatus: 'completed',
          waiverId: waiver._id
        });
      }

      // Send waiver confirmation email
      try {
        if (waiverData.participantInfo.email) {
          await EmailService.sendWaiverConfirmation(waiver, waiverData.participantInfo.email);
        }
      } catch (emailError) {
        console.error('Failed to send waiver confirmation email:', emailError);
      }

      res.status(201).json({
        success: true,
        message: 'Waiver submitted successfully',
        data: waiver
      });
    } catch (error) {
      console.error('Submit waiver error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get single waiver
  static async getWaiver(req, res) {
    try {
      const waiver = await Waiver.findById(req.params.id)
        .populate('bookingId', 'eventType eventDate customerInfo')
        .populate('userId', 'name email');

      if (!waiver) {
        return res.status(404).json({
          success: false,
          message: 'Waiver not found'
        });
      }

      // Check if user can access this waiver
      if (req.user.role !== 'admin' && waiver.userId && waiver.userId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this waiver'
        });
      }

      res.json({
        success: true,
        data: waiver
      });
    } catch (error) {
      console.error('Get waiver error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get waiver by booking ID
  static async getWaiverByBooking(req, res) {
    try {
      const { bookingId } = req.params;

      const waiver = await Waiver.findOne({ bookingId })
        .populate('bookingId', 'eventType eventDate customerInfo')
        .populate('userId', 'name email');

      if (!waiver) {
        return res.status(404).json({
          success: false,
          message: 'Waiver not found for this booking'
        });
      }

      // Check if user can access this waiver
      if (req.user.role !== 'admin' && waiver.userId && waiver.userId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this waiver'
        });
      }

      res.json({
        success: true,
        data: waiver
      });
    } catch (error) {
      console.error('Get waiver by booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Update waiver (admin only)
  static async updateWaiver(req, res) {
    try {
      const waiver = await Waiver.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!waiver) {
        return res.status(404).json({
          success: false,
          message: 'Waiver not found'
        });
      }

      res.json({
        success: true,
        message: 'Waiver updated successfully',
        data: waiver
      });
    } catch (error) {
      console.error('Update waiver error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get waiver template/form data
  static async getWaiverTemplate(req, res) {
    try {
      const { eventType = 'general' } = req.query;

      // Define waiver templates based on event type
      const templates = {
        general: {
          title: 'General Activity Waiver and Release',
          sections: [
            {
              title: 'Assumption of Risk',
              content: 'I acknowledge that participation in activities at Paintball 2 Go involves inherent risks and dangers...'
            },
            {
              title: 'Release and Indemnification',
              content: 'I hereby release and discharge Paintball 2 Go from any and all liability...'
            }
          ],
          requiredFields: [
            'participantInfo.name',
            'participantInfo.email',
            'participantInfo.phone',
            'participantInfo.dateOfBirth',
            'participantInfo.address',
            'emergencyContact.name',
            'emergencyContact.phone',
            'medicalInfo.conditions',
            'signature'
          ]
        },
        paintball: {
          title: 'Paintball Activity Waiver and Release',
          sections: [
            {
              title: 'Paintball-Specific Risks',
              content: 'I understand that paintball involves the use of paintball markers and CO2/compressed air...'
            },
            {
              title: 'Safety Equipment',
              content: 'I agree to wear all required safety equipment including protective masks at all times...'
            }
          ],
          requiredFields: [
            'participantInfo.name',
            'participantInfo.email',
            'participantInfo.phone',
            'participantInfo.dateOfBirth',
            'participantInfo.address',
            'emergencyContact.name',
            'emergencyContact.phone',
            'medicalInfo.conditions',
            'signature'
          ]
        },
        gellyball: {
          title: 'GellyBall Activity Waiver and Release',
          sections: [
            {
              title: 'GellyBall-Specific Information',
              content: 'I understand that GellyBall uses soft gel balls and is a low-impact activity...'
            }
          ],
          requiredFields: [
            'participantInfo.name',
            'participantInfo.email',
            'participantInfo.phone',
            'participantInfo.dateOfBirth',
            'emergencyContact.name',
            'emergencyContact.phone',
            'signature'
          ]
        }
      };

      const template = templates[eventType] || templates.general;

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error('Get waiver template error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get waiver statistics (admin only)
  static async getWaiverStats(req, res) {
    try {
      const { startDate, endDate } = req.query;

      let matchStage = {};
      if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = new Date(startDate);
        if (endDate) matchStage.createdAt.$lte = new Date(endDate);
      }

      const stats = await Waiver.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalWaivers: { $sum: 1 },
            completedWaivers: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            pendingWaivers: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            waiversByEventType: {
              $push: {
                eventType: '$eventType',
                count: 1
              }
            }
          }
        }
      ]);

      // Get completion rate by event type
      const completionByEventType = await Waiver.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$eventType',
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            eventType: '$_id',
            total: 1,
            completed: 1,
            completionRate: {
              $multiply: [
                { $divide: ['$completed', '$total'] },
                100
              ]
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          overview: stats[0] || {
            totalWaivers: 0,
            completedWaivers: 0,
            pendingWaivers: 0,
            waiversByEventType: []
          },
          completionByEventType
        }
      });
    } catch (error) {
      console.error('Get waiver stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = WaiverController;
