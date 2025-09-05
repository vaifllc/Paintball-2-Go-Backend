"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const emailService_1 = require("../services/emailService");
const express_validator_1 = require("express-validator");
class AuthController {
    static async register(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }
            const { name, email, password } = req.body;
            const existingUser = await User_1.default.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists with this email'
                });
            }
            const user = new User_1.default({
                name,
                email,
                password,
                role: 'user'
            });
            await user.save();
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
            try {
                await emailService_1.EmailService.sendWelcomeEmail(email, name);
            }
            catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
            }
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
    static async login(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }
            const { email, password } = req.body;
            const user = await User_1.default.findOne({ email }).select('+password');
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated. Please contact support.'
                });
            }
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
            user.lastLogin = new Date();
            await user.save();
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
            res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
    static async getProfile(req, res) {
        try {
            const user = await User_1.default.findById(req.user.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            res.json({
                success: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified,
                    lastLogin: user.lastLogin
                }
            });
        }
        catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
    static async updateProfile(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }
            const updates = req.body;
            const allowedUpdates = ['name', 'email'];
            const filteredUpdates = {};
            Object.keys(updates).forEach(key => {
                if (allowedUpdates.includes(key)) {
                    filteredUpdates[key] = updates[key];
                }
            });
            if (filteredUpdates.email) {
                const existingUser = await User_1.default.findOne({
                    email: filteredUpdates.email,
                    _id: { $ne: req.user.id }
                });
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email already in use'
                    });
                }
            }
            const user = await User_1.default.findByIdAndUpdate(req.user.id, filteredUpdates, { new: true, runValidators: true });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            res.json({
                success: true,
                message: 'Profile updated successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        }
        catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
    static async logout(req, res) {
        try {
            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        }
        catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
    static async forgotPassword(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }
            const { email } = req.body;
            const user = await User_1.default.findOne({ email });
            if (!user) {
                return res.json({
                    success: true,
                    message: 'If an account with that email exists, a reset link has been sent.'
                });
            }
            const resetToken = jsonwebtoken_1.default.sign({ userId: user._id, type: 'password_reset' }, process.env.JWT_SECRET, { expiresIn: '1h' });
            try {
                await emailService_1.EmailService.sendPasswordResetEmail(email, user.name, resetToken);
            }
            catch (emailError) {
                console.error('Failed to send password reset email:', emailError);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to send reset email'
                });
            }
            res.json({
                success: true,
                message: 'If an account with that email exists, a reset link has been sent.'
            });
        }
        catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map