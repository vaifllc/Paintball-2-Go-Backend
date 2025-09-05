const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { StripeService } = require('../services/stripeService');
const { EmailService } = require('../services/emailService');
const { validationResult } = require('express-validator');

class SubscriptionController {
  // Get all subscriptions (admin only)
  static async getAllSubscriptions(req, res) {
    try {
      const { page = 1, limit = 10, status, plan } = req.query;

      let query = {};

      if (status) {
        query.status = status;
      }

      if (plan) {
        query.plan = plan;
      }

      const subscriptions = await Subscription.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await Subscription.countDocuments(query);

      res.json({
        success: true,
        count: subscriptions.length,
        total,
        data: subscriptions
      });
    } catch (error) {
      console.error('Get all subscriptions error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get user's subscriptions
  static async getUserSubscriptions(req, res) {
    try {
      const subscriptions = await Subscription.find({ userId: req.user.id })
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        count: subscriptions.length,
        data: subscriptions
      });
    } catch (error) {
      console.error('Get user subscriptions error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Create subscription
  static async createSubscription(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { plan, paymentMethodId } = req.body;

      // Check if user already has an active subscription
      const existingSubscription = await Subscription.findOne({
        userId: req.user.id,
        status: 'active'
      });

      if (existingSubscription) {
        return res.status(400).json({
          success: false,
          message: 'User already has an active subscription'
        });
      }

      // Create Stripe customer if user doesn't have one
      const user = await User.findById(req.user.id);
      let customerId = user.stripeCustomerId;

      if (!customerId) {
        const customerResult = await StripeService.createCustomer({
          email: user.email,
          name: user.name,
          metadata: { userId: user._id.toString() }
        });

        if (customerResult.success) {
          customerId = customerResult.customer.id;
          user.stripeCustomerId = customerId;
          await user.save();
        } else {
          return res.status(400).json({
            success: false,
            message: 'Failed to create customer',
            error: customerResult.error
          });
        }
      }

      // Create Stripe subscription
      const subscriptionResult = await StripeService.createSubscription({
        customerId,
        priceId: plan.stripePriceId,
        paymentMethodId,
        metadata: {
          userId: req.user.id,
          planName: plan.name
        }
      });

      if (subscriptionResult.success) {
        // Create subscription record in our database
        const subscription = new Subscription({
          userId: req.user.id,
          stripeSubscriptionId: subscriptionResult.subscription.id,
          plan: plan.name,
          status: subscriptionResult.subscription.status,
          currentPeriodStart: new Date(subscriptionResult.subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscriptionResult.subscription.current_period_end * 1000),
          billingCycle: plan.billingCycle,
          amount: plan.price,
          features: plan.features
        });

        await subscription.save();

        // Update user's membership tier
        user.membershipTier = plan.name;
        await user.save();

        // Send subscription confirmation email
        try {
          await EmailService.sendSubscriptionConfirmation(subscription, user.email);
        } catch (emailError) {
          console.error('Failed to send subscription confirmation email:', emailError);
        }

        res.status(201).json({
          success: true,
          message: 'Subscription created successfully',
          data: subscription
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to create subscription',
          error: subscriptionResult.error
        });
      }
    } catch (error) {
      console.error('Create subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get single subscription
  static async getSubscription(req, res) {
    try {
      const subscription = await Subscription.findById(req.params.id)
        .populate('userId', 'name email');

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
      }

      // Check if user can access this subscription
      if (req.user.role !== 'admin' && subscription.userId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this subscription'
        });
      }

      res.json({
        success: true,
        data: subscription
      });
    } catch (error) {
      console.error('Get subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Update subscription
  static async updateSubscription(req, res) {
    try {
      const { plan } = req.body;

      const subscription = await Subscription.findById(req.params.id);

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
      }

      // Check if user can update this subscription
      if (req.user.role !== 'admin' && subscription.userId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this subscription'
        });
      }

      // Update Stripe subscription
      const updateResult = await StripeService.updateSubscription(
        subscription.stripeSubscriptionId,
        { priceId: plan.stripePriceId }
      );

      if (updateResult.success) {
        // Update our database record
        subscription.plan = plan.name;
        subscription.amount = plan.price;
        subscription.features = plan.features;
        await subscription.save();

        res.json({
          success: true,
          message: 'Subscription updated successfully',
          data: subscription
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to update subscription',
          error: updateResult.error
        });
      }
    } catch (error) {
      console.error('Update subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Cancel subscription
  static async cancelSubscription(req, res) {
    try {
      const { reason, cancelAtPeriodEnd = true } = req.body;

      const subscription = await Subscription.findById(req.params.id);

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
      }

      // Check if user can cancel this subscription
      if (req.user.role !== 'admin' && subscription.userId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to cancel this subscription'
        });
      }

      // Cancel Stripe subscription
      const cancelResult = await StripeService.cancelSubscription(
        subscription.stripeSubscriptionId,
        cancelAtPeriodEnd
      );

      if (cancelResult.success) {
        // Update our database record
        subscription.status = cancelAtPeriodEnd ? 'cancel_at_period_end' : 'canceled';
        subscription.canceledAt = new Date();
        subscription.cancellationReason = reason;
        await subscription.save();

        // Update user's membership tier if canceled immediately
        if (!cancelAtPeriodEnd) {
          const user = await User.findById(subscription.userId);
          user.membershipTier = 'basic';
          await user.save();
        }

        res.json({
          success: true,
          message: 'Subscription canceled successfully',
          data: subscription
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to cancel subscription',
          error: cancelResult.error
        });
      }
    } catch (error) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Reactivate subscription
  static async reactivateSubscription(req, res) {
    try {
      const subscription = await Subscription.findById(req.params.id);

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
      }

      // Check if user can reactivate this subscription
      if (req.user.role !== 'admin' && subscription.userId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to reactivate this subscription'
        });
      }

      if (subscription.status !== 'cancel_at_period_end') {
        return res.status(400).json({
          success: false,
          message: 'Subscription cannot be reactivated'
        });
      }

      // Reactivate Stripe subscription
      const reactivateResult = await StripeService.updateSubscription(
        subscription.stripeSubscriptionId,
        { cancel_at_period_end: false }
      );

      if (reactivateResult.success) {
        subscription.status = 'active';
        subscription.canceledAt = null;
        subscription.cancellationReason = null;
        await subscription.save();

        res.json({
          success: true,
          message: 'Subscription reactivated successfully',
          data: subscription
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to reactivate subscription',
          error: reactivateResult.error
        });
      }
    } catch (error) {
      console.error('Reactivate subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get subscription statistics (admin only)
  static async getSubscriptionStats(req, res) {
    try {
      const stats = await Subscription.aggregate([
        {
          $group: {
            _id: null,
            totalSubscriptions: { $sum: 1 },
            activeSubscriptions: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            canceledSubscriptions: {
              $sum: { $cond: [{ $eq: ['$status', 'canceled'] }, 1, 0] }
            },
            totalRevenue: { $sum: '$amount' },
            averageSubscriptionValue: { $avg: '$amount' }
          }
        }
      ]);

      // Get subscription breakdown by plan
      const planBreakdown = await Subscription.aggregate([
        {
          $group: {
            _id: '$plan',
            count: { $sum: 1 },
            revenue: { $sum: '$amount' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      res.json({
        success: true,
        data: {
          overview: stats[0] || {
            totalSubscriptions: 0,
            activeSubscriptions: 0,
            canceledSubscriptions: 0,
            totalRevenue: 0,
            averageSubscriptionValue: 0
          },
          planBreakdown
        }
      });
    } catch (error) {
      console.error('Get subscription stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = SubscriptionController;
