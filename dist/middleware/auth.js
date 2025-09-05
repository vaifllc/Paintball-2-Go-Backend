"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMaintenanceMode = exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies.token) {
        token = req.cookies.token;
    }
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await User_1.default.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account has been deactivated'
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};
exports.protect = protect;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};
exports.authorize = authorize;
const checkMaintenanceMode = (req, res, next) => {
    const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';
    const maintenanceMessage = process.env.MAINTENANCE_MESSAGE || 'Site is under maintenance';
    if (isMaintenanceMode && !req.path.startsWith('/api/auth') && !req.path.startsWith('/api/admin')) {
        return res.status(503).json({
            success: false,
            message: maintenanceMessage,
            maintenanceMode: true
        });
    }
    next();
};
exports.checkMaintenanceMode = checkMaintenanceMode;
//# sourceMappingURL=auth.js.map