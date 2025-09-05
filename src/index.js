const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

const connectDB = require('./config/database');
const { checkMaintenanceMode } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const cmsRoutes = require('./routes/cms');
const emailRoutes = require('./routes/email');
const paymentRoutes = require('./routes/payment');
const bookingRoutes = require('./routes/booking');
const invoiceRoutes = require('./routes/invoice');
const subscriptionRoutes = require('./routes/subscription');
const faqRoutes = require('./routes/faq');
const waiverRoutes = require('./routes/waiver');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Connect to database
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Apply rate limiting to all requests
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Maintenance mode check
app.use(checkMaintenanceMode);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-admin', () => {
    socket.join('admin-room');
    console.log('Admin joined room');
  });

  socket.on('cms-update', (data) => {
    // Broadcast CMS updates to all connected clients
    socket.broadcast.emit('cms-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available in routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/waivers', waiverRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    maintenance: process.env.MAINTENANCE_MODE === 'true'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Handle 404 (match all routes)
app.use((req, res) => {
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