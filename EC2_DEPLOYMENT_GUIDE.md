# 🚀 AWS EC2 Deployment Guide for Paintball 2 Go Backend

This comprehensive guide will walk you through deploying your Node.js backend on AWS EC2, from zero to production-ready.

## 📋 Prerequisites

- AWS Account with billing set up
- Domain name (optional but recommended)
- Basic knowledge of terminal/command line
- Your backend code ready (which we have! ✅)

## 🎯 What We'll Set Up

- **EC2 Instance** - Ubuntu 22.04 LTS server
- **MongoDB** - Database server
- **Node.js** - Runtime environment
- **PM2** - Process manager for production
- **Nginx** - Reverse proxy and SSL
- **SSL Certificate** - Free Let's Encrypt certificate
- **Firewall** - Security configuration

---

## 🔧 Step 1: Create EC2 Instance

### 1.1 Login to AWS Console
1. Go to [AWS Console](https://console.aws.amazon.com)
2. Search for "EC2" in the services
3. Click on "EC2" to open the dashboard

### 1.2 Launch Instance
1. Click **"Launch Instance"**
2. **Name your instance**: `paintball2go-backend`

### 1.3 Choose AMI (Amazon Machine Image)
- Select **"Ubuntu Server 22.04 LTS (HVM), SSD Volume Type"**
- Architecture: **64-bit (x86)**

### 1.4 Choose Instance Type
- **Recommended**: `t3.small` (2 vCPU, 2 GB RAM) - ~$15/month
- **Budget option**: `t2.micro` (1 vCPU, 1 GB RAM) - Free tier eligible
- **Performance option**: `t3.medium` (2 vCPU, 4 GB RAM) - ~$30/month

### 1.5 Key Pair (Login)
1. Click **"Create new key pair"**
2. **Key pair name**: `paintball2go-key`
3. **Key pair type**: RSA
4. **Private key file format**: `.pem`
5. Click **"Create key pair"** and **save the file securely**

### 1.6 Network Settings
1. Click **"Edit"** next to Network settings
2. **VPC**: Leave default
3. **Auto-assign public IP**: Enable
4. **Firewall (Security Groups)**: Create security group
   - **Security group name**: `paintball2go-sg`
   - **Description**: Security group for Paintball 2 Go backend

5. **Inbound Security Group Rules**:
   ```
   Type: SSH, Port: 22, Source: My IP (for your current IP)
   Type: HTTP, Port: 80, Source: Anywhere (0.0.0.0/0)
   Type: HTTPS, Port: 443, Source: Anywhere (0.0.0.0/0)
   Type: Custom TCP, Port: 5000, Source: Anywhere (0.0.0.0/0)
   ```

### 1.7 Configure Storage
- **Size**: 20 GB (minimum recommended)
- **Volume Type**: gp3 (General Purpose SSD)

### 1.8 Launch Instance
1. Review all settings
2. Click **"Launch instance"**
3. Wait for instance to be in **"running"** state

---

## 🔑 Step 2: Connect to Your Instance

### 2.1 Get Connection Details
1. Select your instance in EC2 dashboard
2. Click **"Connect"**
3. Note the **Public IPv4 address**

### 2.2 Connect via SSH

**On macOS/Linux:**
```bash
# Make key file secure
chmod 400 ~/Downloads/paintball2go-key.pem

# Connect to instance
ssh -i ~/Downloads/paintball2go-key.pem ubuntu@YOUR_PUBLIC_IP
```

**On Windows (using PowerShell):**
```powershell
# Connect to instance
ssh -i C:\Users\YourName\Downloads\paintball2go-key.pem ubuntu@YOUR_PUBLIC_IP
```

**First time connection:**
- Type `yes` when prompted about authenticity

---

## ⚙️ Step 3: Server Setup

### 3.1 Update System
```bash
# Update package list
sudo apt update

# Upgrade packages
sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip emacs
```

### 3.2 Install Node.js
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3.3 Install MongoDB
```bash
# Import MongoDB public GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Create MongoDB list file
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

### 3.4 Install PM2 (Process Manager)
```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions output by the command above
```

### 3.5 Install Nginx
```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

---

## 📁 Step 4: Deploy Your Application

### 4.1 Create Application Directory
```bash
# Create app directory
sudo mkdir -p /var/www/paintball2go
sudo chown -R ubuntu:ubuntu /var/www/paintball2go
cd /var/www/paintball2go
```

### 4.2 Clone Your Repository
```bash
# Clone your repository (replace with your actual repo URL)
git clone https://github.com/yourusername/paintball-2-go-main.git .

# Navigate to server directory
cd apps/server
```

### 4.3 Install Dependencies
```bash
# Install npm dependencies
npm install

# Install PM2 globally if not already done
sudo npm install -g pm2
```

### 4.4 Create Environment Variables
```bash
# Create .env file
nano .env
```

**Add the following content** (replace with your actual values):
```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/paintball2go

# JWT Secret (generate a secure random string)
JWT_SECRET=your_super_secure_jwt_secret_here_make_it_long_and_random

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key_here

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Maintenance Mode
MAINTENANCE_MODE=false
MAINTENANCE_MESSAGE=Site is under maintenance. Please check back later.
```

**Save the file**: `Ctrl + X`, then `Y`, then `Enter`

### 4.5 Seed the Database
```bash
# Run the seed script
npm run seed
```

### 4.6 Test the Application
```bash
# Test the application manually first
npm start

# In another terminal (or new SSH session), test the API
curl http://localhost:5000/api/health

# Stop the manual test (Ctrl + C)
```

---

## 🚀 Step 5: Production Setup with PM2

### 5.1 Create PM2 Ecosystem File
```bash
# Create PM2 config file
nano ecosystem.config.js
```

**Add the following content:**
```javascript
module.exports = {
  apps: [{
    name: 'paintball2go-backend',
    script: 'src/index.js',
    cwd: '/var/www/paintball2go/apps/server',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/www/paintball2go/logs/err.log',
    out_file: '/var/www/paintball2go/logs/out.log',
    log_file: '/var/www/paintball2go/logs/combined.log',
    time: true
  }]
};
```

### 5.2 Create Logs Directory
```bash
# Create logs directory
mkdir -p /var/www/paintball2go/logs
```

### 5.3 Start Application with PM2
```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check application status
pm2 status
pm2 logs paintball2go-backend
```

---

## 🌐 Step 6: Configure Nginx Reverse Proxy

### 6.1 Create Nginx Configuration
```bash
# Create nginx site configuration
sudo nano /etc/nginx/sites-available/paintball2go
```

**Add the following content:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # Replace with your actual domain

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # API routes
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5000/api/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Root location (if you have a frontend later)
    location / {
        return 200 'Paintball 2 Go API Server Running';
        add_header Content-Type text/plain;
    }
}
```

### 6.2 Enable the Site
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/paintball2go /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

---

## 🔒 Step 7: SSL Certificate with Let's Encrypt

### 7.1 Install Certbot
```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Obtain SSL Certificate
```bash
# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow the prompts:
# 1. Enter email address
# 2. Agree to terms of service (Y)
# 3. Share email with EFF (Y/N - your choice)
```

### 7.3 Set Up Auto-Renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Set up automatic renewal (already configured by default)
sudo systemctl status certbot.timer
```

---

## 🛡️ Step 8: Security Configuration

### 8.1 Configure UFW Firewall
```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Check status
sudo ufw status
```

### 8.2 Secure MongoDB
```bash
# Create MongoDB admin user
mongosh

# In MongoDB shell:
use admin
db.createUser({
  user: "admin",
  pwd: "your_secure_password_here",
  roles: ["root"]
})

# Create application user
use paintball2go
db.createUser({
  user: "pb2go_user",
  pwd: "another_secure_password",
  roles: ["readWrite"]
})

exit
```

### 8.3 Enable MongoDB Authentication
```bash
# Edit MongoDB config
sudo nano /etc/mongod.conf
```

**Add/modify these lines:**
```yaml
security:
  authorization: enabled
```

**Restart MongoDB:**
```bash
sudo systemctl restart mongod
```

### 8.4 Update Application Environment
```bash
# Update .env file with authenticated MongoDB URI
nano /var/www/paintball2go/apps/server/.env
```

**Update MongoDB URI:**
```env
MONGODB_URI=mongodb://pb2go_user:another_secure_password@localhost:27017/paintball2go
```

**Restart application:**
```bash
pm2 restart paintball2go-backend
```

---

## 📊 Step 9: Monitoring and Maintenance

### 9.1 Set Up Log Rotation
```bash
# Create logrotate config
sudo nano /etc/logrotate.d/paintball2go
```

**Add the following:**
```
/var/www/paintball2go/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    copytruncate
}
```

### 9.2 PM2 Monitoring
```bash
# Monitor application
pm2 monit

# View logs
pm2 logs paintball2go-backend

# Restart application
pm2 restart paintball2go-backend

# Reload application (zero downtime)
pm2 reload paintball2go-backend
```

### 9.3 System Monitoring
```bash
# Check system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h

# Check MongoDB status
sudo systemctl status mongod
```

---

## ✅ Step 10: Verification and Testing

### 10.1 Test Your API
```bash
# Test health endpoint
curl https://your-domain.com/health

# Test API endpoints
curl https://your-domain.com/api/health
curl https://your-domain.com/api/faq
```

### 10.2 Test from External Tools
Use Postman or similar to test:
- `GET https://your-domain.com/api/health`
- `GET https://your-domain.com/api/faq`
- `POST https://your-domain.com/api/auth/register`

---

## 🚀 Step 11: Deployment Script (Optional)

Create a deployment script for easy updates:

```bash
# Create deployment script
nano /var/www/paintball2go/deploy.sh
```

**Add the following:**
```bash
#!/bin/bash

echo "🚀 Deploying Paintball 2 Go Backend..."

# Navigate to project directory
cd /var/www/paintball2go

# Pull latest changes
git pull origin main

# Navigate to server directory
cd apps/server

# Install dependencies
npm install

# Restart application
pm2 restart paintball2go-backend

echo "✅ Deployment complete!"
echo "📊 Checking application status..."
pm2 status
```

**Make it executable:**
```bash
chmod +x /var/www/paintball2go/deploy.sh
```

**To deploy updates:**
```bash
cd /var/www/paintball2go
./deploy.sh
```

---

## 📋 Quick Reference Commands

### Application Management
```bash
# Start application
pm2 start ecosystem.config.js

# Restart application
pm2 restart paintball2go-backend

# Stop application
pm2 stop paintball2go-backend

# View logs
pm2 logs paintball2go-backend

# Monitor
pm2 monit
```

### Server Management
```bash
# Restart Nginx
sudo systemctl restart nginx

# Restart MongoDB
sudo systemctl restart mongod

# Check system status
sudo systemctl status nginx
sudo systemctl status mongod
```

### SSL Certificate
```bash
# Renew certificate
sudo certbot renew

# Check certificate expiration
sudo certbot certificates
```

---

## 🆘 Troubleshooting

### Common Issues

**1. Application won't start:**
```bash
# Check logs
pm2 logs paintball2go-backend

# Check if port is in use
sudo netstat -tulpn | grep :5000

# Restart application
pm2 restart paintball2go-backend
```

**2. Database connection issues:**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo journalctl -u mongod

# Test MongoDB connection
mongosh "mongodb://localhost:27017/paintball2go"
```

**3. SSL issues:**
```bash
# Test SSL certificate
openssl s_client -connect your-domain.com:443

# Renew certificate
sudo certbot renew
```

**4. Nginx issues:**
```bash
# Test nginx config
sudo nginx -t

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## 💰 Cost Estimation

### Monthly AWS Costs (US East)
- **t2.micro (Free Tier)**: $0 for 12 months, then ~$8.50/month
- **t3.small**: ~$15.18/month
- **t3.medium**: ~$30.37/month
- **Storage (20GB)**: ~$2.40/month
- **Data Transfer**: Usually free for first 1GB/month

### Additional Services (Optional)
- **Route 53 (DNS)**: $0.50/month per hosted zone
- **CloudWatch (Monitoring)**: $3+/month
- **Load Balancer**: $16+/month

---

## 🎉 Congratulations!

Your Paintball 2 Go backend is now live and production-ready!

### What You've Accomplished:
✅ **Secure EC2 server** with Ubuntu 22.04
✅ **Production Node.js environment** with PM2
✅ **MongoDB database** with authentication
✅ **Nginx reverse proxy** with SSL
✅ **Free SSL certificate** from Let's Encrypt
✅ **Firewall protection** with UFW
✅ **Automated deployments** script
✅ **Monitoring and logging** setup

### Your API is now accessible at:
- **Health Check**: `https://your-domain.com/api/health`
- **FAQ Endpoint**: `https://your-domain.com/api/faq`
- **Auth Endpoints**: `https://your-domain.com/api/auth/*`
- **Booking Endpoints**: `https://your-domain.com/api/bookings/*`

### Next Steps:
1. **Point your domain** to the EC2 IP address
2. **Set up monitoring** with CloudWatch or external tools
3. **Configure automated backups** for MongoDB
4. **Set up CI/CD pipeline** for automated deployments
5. **Add CloudFront CDN** for better performance

Your backend is now ready to handle real users and scale as your business grows! 🚀

---

## 📞 Support

If you run into any issues:
1. Check the troubleshooting section above
2. Review AWS EC2 documentation
3. Check PM2 and Nginx documentation
4. Monitor logs with `pm2 logs` and system logs

Remember to keep your system updated and monitor resource usage as your application grows!
