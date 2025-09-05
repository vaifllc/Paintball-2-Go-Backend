# Paintball 2 Go - Backend API

A comprehensive Node.js + MongoDB backend for the Paintball 2 Go mobile entertainment service platform.

## 🚀 Features

### Core Features
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Registration, login, profile management
- **Booking System**: Complete booking lifecycle with payment integration
- **Invoice Management**: Automated billing and payment tracking
- **Subscription Management**: Multiple tiers with Stripe integration
- **Digital Waiver System**: Electronic signature capture and validation
- **FAQ Management**: Dynamic FAQ system with admin controls
- **Email System**: Resend integration with beautiful templates
- **Analytics & Reporting**: Comprehensive business intelligence
- **Real-time Updates**: Socket.io for live data synchronization

### Payment Features
- **Stripe Integration**: Full payment processing and subscription management
- **CashApp Integration**: Placeholder for hybrid payment system
- **Automated Invoicing**: Generate and send invoices automatically
- **Payment Tracking**: Complete payment lifecycle management

### CMS Features
- **Content Management**: Dynamic content blocks for frontend
- **Email Templates**: Professional email templates for all notifications
- **File Upload**: Secure file handling with validation
- **Real-time Updates**: Live CMS updates via WebSocket

### Security Features
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Secure cross-origin requests
- **Helmet Security**: Security headers for production
- **Maintenance Mode**: System-wide maintenance mode

## 📁 Project Structure

```
src/
├── config/
│   └── database.ts          # MongoDB connection setup
├── controllers/
│   └── authController.ts    # Authentication controllers
├── middleware/
│   └── auth.ts              # Authentication & authorization middleware
├── models/                  # Mongoose schemas
│   ├── User.ts
│   ├── Booking.ts
│   ├── Invoice.ts
│   ├── Subscription.ts
│   ├── ContentBlock.ts
│   ├── EmailTemplate.ts
│   ├── EmailCampaign.ts
│   ├── FAQ.ts
│   ├── Waiver.ts
│   └── Analytics.ts
├── routes/                  # API route definitions
│   ├── auth.ts
│   ├── booking.ts
│   ├── invoice.ts
│   ├── subscription.ts
│   ├── cms.ts
│   ├── email.ts
│   ├── payment.ts
│   ├── faq.ts
│   ├── waiver.ts
│   └── analytics.ts
├── services/                # Business logic services
│   ├── emailService.ts
│   └── stripeService.ts
├── utils/                   # Utility functions
│   ├── helpers.ts
│   └── emailTemplates.ts
├── scripts/                 # Database scripts
│   └── seed.ts
└── index.ts                 # Main application entry point
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account or local MongoDB
- Stripe account for payments
- Resend account for emails

### Environment Variables
Create a `.env` file in the server directory:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/paintball2go

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Server
PORT=5000
NODE_ENV=development

# Email Service (Resend)
RESEND_API_KEY=re_your_resend_api_key

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# CashApp (Placeholder)
CASHAPP_CLIENT_ID=your_cashapp_client_id
CASHAPP_CLIENT_SECRET=your_cashapp_client_secret

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Maintenance Mode
MAINTENANCE_MODE=false
MAINTENANCE_MESSAGE=We're performing scheduled maintenance. Please check back soon.

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads/
```

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Build TypeScript**
   ```bash
   npm run build
   ```

4. **Seed Database**
   ```bash
   npm run seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Start Production Server**
   ```bash
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update profile (protected)
- `POST /api/auth/logout` - Logout (protected)
- `POST /api/auth/forgot-password` - Password reset request

### Booking Endpoints
- `GET /api/bookings` - Get user bookings (protected)
- `GET /api/bookings/:id` - Get single booking (protected)
- `POST /api/bookings` - Create booking (protected)
- `PUT /api/bookings/:id` - Update booking (protected)
- `DELETE /api/bookings/:id` - Cancel booking (protected)

### Admin Endpoints
- `GET /api/bookings/admin/all` - Get all bookings (admin)
- `PUT /api/bookings/admin/:id/status` - Update booking status (admin)
- `GET /api/analytics/admin/dashboard` - Dashboard metrics (admin)
- `GET /api/email/admin/campaigns` - Email campaigns (admin)

### Payment Endpoints
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/create-customer` - Create Stripe customer
- `POST /api/payments/webhook` - Stripe webhook handler

### CMS Endpoints
- `GET /api/cms/content` - Get published content (public)
- `GET /api/cms/admin/content` - Get all content (admin)
- `POST /api/cms/admin/content` - Create content (admin)
- `PUT /api/cms/admin/content/:id` - Update content (admin)

## 🔐 Default Login Credentials

After running the seed script:

**Admin Account:**
- Email: `admin@paintball2go.net`
- Password: `Admin123!`

**Test User Account:**
- Email: `john@example.com`
- Password: `Password123!`

## 📧 Email Templates

The system includes professional email templates for:
- Welcome emails
- Booking confirmations
- Payment confirmations
- Password reset
- Waiver confirmations

All templates are responsive and branded with Paintball 2 Go styling.

## 🗃️ Database Schema

### Key Models

**User**
- Authentication and profile information
- Role-based access control
- Subscription tracking

**Booking**
- Complete booking details
- Payment tracking
- Customer information
- Waiver requirements

**Invoice**
- Automated billing
- Payment status tracking
- Line item details

**Subscription**
- Multiple plan tiers
- Stripe integration
- Usage tracking

**Waiver**
- Digital signature capture
- Minor participant handling
- Activity-specific waivers

## 🔄 Real-time Features

The API supports real-time updates via Socket.io for:
- CMS content changes
- Booking status updates
- Admin notifications
- System announcements

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Check for linting issues
npm run lint

# Format code
npm run format
```

## 📦 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure all production environment variables
3. Set up MongoDB Atlas cluster
4. Configure Stripe production keys
5. Set up Resend production account

### Build & Deploy
```bash
# Build for production
npm run build

# Seed production database
npm run seed:prod

# Start production server
npm start
```

### Health Check
The API includes a health check endpoint:
```
GET /api/health
```

## 🔧 Maintenance Mode

Enable maintenance mode by setting:
```env
MAINTENANCE_MODE=true
MAINTENANCE_MESSAGE=Custom maintenance message
```

This will return a 503 status for all requests except admin routes.

## 📊 Analytics

The system tracks:
- Page views and user interactions
- Booking conversion rates
- Revenue analytics
- Email campaign performance
- User engagement metrics

## 🛡️ Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection
- Security headers with Helmet
- File upload validation

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB URI in .env
   - Ensure network access in MongoDB Atlas
   - Verify credentials

2. **Email Sending Failed**
   - Verify Resend API key
   - Check email template formatting
   - Ensure sender domain is verified

3. **Stripe Integration Issues**
   - Verify API keys are correct
   - Check webhook endpoint configuration
   - Ensure test/production mode consistency

4. **CORS Errors**
   - Update FRONTEND_URL in .env
   - Check CORS middleware configuration

## 📞 Support

For technical support or questions:
- Email: support@paintball2go.net
- Phone: (248) 660-0579

## 📄 License

Copyright © 2025 Paintball 2 Go LLC. All rights reserved.