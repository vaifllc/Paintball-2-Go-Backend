"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
dotenv_1.default.config();
const database_1 = __importDefault(require("./config/database"));
const auth_1 = require("./middleware/auth");
const auth_2 = __importDefault(require("./routes/auth"));
const cms_1 = __importDefault(require("./routes/cms"));
const email_1 = __importDefault(require("./routes/email"));
const payment_1 = __importDefault(require("./routes/payment"));
const booking_1 = __importDefault(require("./routes/booking"));
const invoice_1 = __importDefault(require("./routes/invoice"));
const subscription_1 = __importDefault(require("./routes/subscription"));
const faq_1 = __importDefault(require("./routes/faq"));
const waiver_1 = __importDefault(require("./routes/waiver"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
(0, database_1.default)();
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use('/api/', limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(auth_1.checkMaintenanceMode);
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('join-admin', () => {
        socket.join('admin-room');
        console.log('Admin joined room');
    });
    socket.on('cms-update', (data) => {
        socket.broadcast.emit('cms-updated', data);
    });
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
app.set('io', io);
app.use('/api/auth', auth_2.default);
app.use('/api/cms', cms_1.default);
app.use('/api/email', email_1.default);
app.use('/api/payments', payment_1.default);
app.use('/api/bookings', booking_1.default);
app.use('/api/invoices', invoice_1.default);
app.use('/api/subscriptions', subscription_1.default);
app.use('/api/faq', faq_1.default);
app.use('/api/waivers', waiver_1.default);
app.use('/api/analytics', analytics_1.default);
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        maintenance: process.env.MAINTENANCE_MODE === 'true'
    });
});
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Maintenance Mode: ${process.env.MAINTENANCE_MODE === 'true' ? 'ON' : 'OFF'}`);
});
//# sourceMappingURL=index.js.map