const Booking = require('../models/Booking');
const { EmailService } = require('../services/emailService');
const { validationResult } = require('express-validator');

class BookingController {
  // Get all bookings (admin only)
  static async getAllBookings(req, res) {
    try {
      const { page = 1, limit = 10, status, eventType, startDate, endDate } = req.query;

      // Build query
      let query = {};

      if (status) {
        query.status = status;
      }

      if (eventType) {
        query.eventType = eventType;
      }

      if (startDate || endDate) {
        query.eventDate = {};
        if (startDate) query.eventDate.$gte = new Date(startDate);
        if (endDate) query.eventDate.$lte = new Date(endDate);
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: {
          path: 'userId',
          select: 'name email'
        }
      };

      const bookings = await Booking.paginate(query, options);

      res.json({
        success: true,
        data: bookings
      });
    } catch (error) {
      console.error('Get all bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get user's bookings
  static async getUserBookings(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;

      let query = { userId: req.user.id };

      if (status) {
        query.status = status;
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 }
      };

      const bookings = await Booking.paginate(query, options);

      res.json({
        success: true,
        data: bookings
      });
    } catch (error) {
      console.error('Get user bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Create new booking
  static async createBooking(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const bookingData = {
        ...req.body,
        userId: req.user ? req.user.id : null,
        status: 'pending'
      };

      // Calculate pricing if not provided
      if (!bookingData.pricing || !bookingData.pricing.totalPrice) {
        const { calculateEventPricing } = require('../utils/helpers');
        const pricing = calculateEventPricing(
          bookingData.eventType,
          bookingData.numberOfPlayers,
          bookingData.pricing?.addOns || []
        );
        bookingData.pricing = {
          basePrice: pricing.basePrice,
          addOns: bookingData.pricing?.addOns || [],
          totalPrice: pricing.total
        };
      }

      const booking = new Booking(bookingData);
      await booking.save();

      // Send booking confirmation email
      try {
        await EmailService.sendBookingConfirmation(booking);
      } catch (emailError) {
        console.error('Failed to send booking confirmation email:', emailError);
        // Don't fail the booking if email fails
      }

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: booking
      });
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get single booking
  static async getBooking(req, res) {
    try {
      const booking = await Booking.findById(req.params.id)
        .populate('userId', 'name email')
        .populate('assignedStaff', 'name email');

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Check if user can access this booking
      if (req.user.role !== 'admin' && booking.userId && booking.userId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this booking'
        });
      }

      res.json({
        success: true,
        data: booking
      });
    } catch (error) {
      console.error('Get booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Update booking
  static async updateBooking(req, res) {
    try {
      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Check if user can update this booking
      if (req.user.role !== 'admin' && booking.userId && booking.userId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this booking'
        });
      }

      // Users can only update certain fields
      let allowedUpdates = ['customerInfo', 'specialRequests'];
      if (req.user.role === 'admin') {
        allowedUpdates = Object.keys(req.body);
      }

      const updates = {};
      allowedUpdates.forEach(key => {
        if (req.body[key] !== undefined) {
          updates[key] = req.body[key];
        }
      });

      const updatedBooking = await Booking.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Booking updated successfully',
        data: updatedBooking
      });
    } catch (error) {
      console.error('Update booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Cancel booking
  static async cancelBooking(req, res) {
    try {
      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Check if user can cancel this booking
      if (req.user.role !== 'admin' && booking.userId && booking.userId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to cancel this booking'
        });
      }

      // Check if booking can be cancelled
      if (!booking.canBeCancelled()) {
        return res.status(400).json({
          success: false,
          message: 'Booking cannot be cancelled. Please contact support.'
        });
      }

      booking.status = 'cancelled';
      booking.cancellation = {
        reason: req.body.reason || 'Cancelled by user',
        cancelledBy: req.user.id,
        cancelledAt: new Date()
      };

      await booking.save();

      res.json({
        success: true,
        message: 'Booking cancelled successfully',
        data: booking
      });
    } catch (error) {
      console.error('Cancel booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Confirm booking (admin only)
  static async confirmBooking(req, res) {
    try {
      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      booking.status = 'confirmed';
      await booking.save();

      // Send confirmation email
      try {
        await EmailService.sendBookingConfirmation(booking);
      } catch (emailError) {
        console.error('Failed to send booking confirmation email:', emailError);
      }

      res.json({
        success: true,
        message: 'Booking confirmed successfully',
        data: booking
      });
    } catch (error) {
      console.error('Confirm booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Complete booking (admin only)
  static async completeBooking(req, res) {
    try {
      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      booking.status = 'completed';
      await booking.save();

      // Update user loyalty points if user exists
      if (booking.userId) {
        const User = require('../models/User');
        const user = await User.findById(booking.userId);
        if (user) {
          user.addActivity({
            activityType: booking.eventType,
            date: booking.eventDate,
            rating: req.body.rating || null,
            feedback: req.body.feedback || null
          });
        }
      }

      res.json({
        success: true,
        message: 'Booking completed successfully',
        data: booking
      });
    } catch (error) {
      console.error('Complete booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get booking statistics (admin only)
  static async getBookingStats(req, res) {
    try {
      const { startDate, endDate } = req.query;

      let matchStage = {};
      if (startDate || endDate) {
        matchStage.eventDate = {};
        if (startDate) matchStage.eventDate.$gte = new Date(startDate);
        if (endDate) matchStage.eventDate.$lte = new Date(endDate);
      }

      const stats = await Booking.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            totalRevenue: { $sum: '$pricing.totalPrice' },
            averageBookingValue: { $avg: '$pricing.totalPrice' },
            bookingsByStatus: {
              $push: {
                status: '$status',
                count: 1
              }
            },
            bookingsByEventType: {
              $push: {
                eventType: '$eventType',
                count: 1
              }
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: stats[0] || {
          totalBookings: 0,
          totalRevenue: 0,
          averageBookingValue: 0,
          bookingsByStatus: [],
          bookingsByEventType: []
        }
      });
    } catch (error) {
      console.error('Get booking stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = BookingController;
