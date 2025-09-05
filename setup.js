#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎯 Setting up Paintball 2 Go Backend...\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📄 Creating .env file from template...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created');
    console.log('⚠️  Please edit .env with your actual values before proceeding\n');
  } else {
    console.log('❌ .env.example file not found');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists');
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed\n');
} catch (error) {
  console.log('❌ Failed to install dependencies');
  console.log(error.message);
  process.exit(1);
}

// Build TypeScript
console.log('🔨 Building TypeScript...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ TypeScript build successful\n');
} catch (error) {
  console.log('❌ TypeScript build failed');
  console.log(error.message);
  process.exit(1);
}

console.log('🎉 Setup completed successfully!\n');
console.log('📋 Next steps:');
console.log('1. Edit .env file with your configuration');
console.log('2. Set up MongoDB database');
console.log('3. Configure Stripe and Resend API keys');
console.log('4. Run: npm run seed (to populate database)');
console.log('5. Run: npm run dev (to start development server)\n');

console.log('🔑 After seeding, default admin login:');
console.log('Email: admin@paintball2go.net');
console.log('Password: Admin123!\n');

console.log('📞 Need help? Contact support@paintball2go.net');
console.log('🌐 Visit: https://paintball2go.net\n');
