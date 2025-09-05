const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/database');
const User = require('../models/User');
const FAQ = require('../models/FAQ');
const ContentBlock = require('../models/ContentBlock');
const EmailTemplate = require('../models/EmailTemplate');

// Load environment variables
dotenv.config();

// Seed data
const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@paintball2go.net',
    password: 'Admin123!',
    role: 'admin',
    isEmailVerified: true,
    isActive: true
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Password123!',
    role: 'user',
    isEmailVerified: true,
    isActive: true
  }
];

const seedFAQs = [
  {
    question: "What is paintball?",
    answer: "A paintball is a round, thin-skinned gelatin capsule, with colored liquid inside of it. Paintballs are similar to large round vitamin capsules or a bath oil bead. The fill inside paintballs is non-toxic, non-caustic, water-soluble and biodegradable. It rinses out of clothing and off skin with mild soap and water. Paintballs are even edible, although we don't recommend it.",
    category: "general",
    order: 1,
    tags: ["paintball", "basics", "safety"],
    isActive: true
  },
  {
    question: "Will it hurt when I get hit with a paintball?",
    answer: "The sting of the paintball hit is what makes this game unique. The thrill of running and jumping, dodging the paintball goes right back to your childhood, and the competition of trying to make the point to win the overall game just adds to the rush. So although getting \"marked\" by a paintball might sting a little, the sensation is similar to getting popped with a towel and will usually go away in a couple seconds.",
    category: "safety",
    order: 2,
    tags: ["paintball", "pain", "safety"],
    isActive: true
  },
  {
    question: "What items should I bring?",
    answer: "During the summer months always carry bug spray and sunscreen. Application of bug spray should be done before you play and will keep the pests off you while engaged in our games. Avoid using bug spray near your goggles. It will damage goggle lenses and other plastic equipment. In the winter lip-balm and good warm gloves are a must. Remember, we are outdoors so dress for it.",
    category: "preparation",
    order: 3,
    tags: ["preparation", "equipment", "seasonal"],
    isActive: true
  },
  {
    question: "Is paintball safe?",
    answer: "The most important safety precaution in the sport of paintball is the full face goggles. We require all participants to wear full-face mask system with ear protection. All visitors to Paintball 2 Go are given a safety briefing every time they visit us. This briefing explains the important safety rules at the park, along with how to properly use the equipment and play the game. We also require guests to chronograph their markers before each game. This allows us to make sure no guests are exceeding the maximum velocity of 285 fps (feet per second).",
    category: "safety",
    order: 4,
    tags: ["safety", "equipment", "rules"],
    isActive: true
  },
  {
    question: "What are paintballs made of?",
    answer: "Paintballs are made of a gelatin shell, the same material that a Tylenol capsule is made of. The RPS Marballizer paintballs that we use have a fill of vegetable oil and food coloring. Our paintballs will not stain your clothes, they are composed of a water soluble fill material. One of the main reasons we insist on our Field Paint only policy and that you have to buy our paintballs is so that a staining paintball can not be brought in and used without our knowledge.",
    category: "general",
    order: 5,
    tags: ["paintball", "materials", "safety"],
    isActive: true
  },
  {
    question: "What type of rental equipment can I rent?",
    answer: "We offer paintball guns, gellyball guns and archery bows. These guns are good for 3-4 balls per second with an accuracy range of approximately 100 feet. We also provide a full face goggle, 200 round loader, a 48 ci compressed air tank that is good for 500 shots before you have to refill and a barrel sleeve for safety.",
    category: "equipment",
    order: 6,
    tags: ["equipment", "rental", "gear"],
    isActive: true
  },
  {
    question: "Can I bring my own equipment?",
    answer: "Yes, but we will inspect your equipment to make sure it meets our safety standards. All goggles must be full-face masks and be unaltered. There can be no cracks in the lenses at all. Paintball markers must be semi-automatic with a trigger guard. If there is a question on if your marker can be used here, a SMP staff member will make it. The decision of SMP staff is final. Barrel sleeves are required on all paintball markers. All CO2 or High Pressure tanks must be in test date. High-pressure fiber wrap tanks may not have any cracks or fraying and can't have any stickers, decals or other coverings on them. Maximum velocity is 285 fps.",
    category: "equipment",
    order: 7,
    tags: ["equipment", "personal", "safety", "rules"],
    isActive: true
  },
  {
    question: "Can I bring my own paintballs?",
    answer: "PB2GO is a multiple sport facility. Therefore, in order to protect all individuals we enforce that you purchase all paintballs from us. By enforcing that you purchase all paintballs from us, we are able to ensure that: no staining or hazardous paintballs are being used, no frozen or non-breaking paintballs are being used as well as keeping the environment clean with paintballs that we know are eco-friendly and made here in the USA.",
    category: "rules",
    order: 8,
    tags: ["paintball", "rules", "policy"],
    isActive: true
  },
  {
    question: "What should I wear?",
    answer: "You want to dress according to the season. Long pants and long sleeve shirts are always recommended, if nothing but to provide a barrier between the paintball and your skin should you get hit. Do not worry about the paint itself, it washes out with water. The dirt and clay from the fox holes and trenches will cause more damage to your clothing and footwear. So dress appropriately. Summer time warrants light colored clothes so as to not attract any more heat than what is already obvious. Winter time justifies a sweat shirt or hoody, so not only will it keep you warm, but also provide plenty of padding.",
    category: "preparation",
    order: 9,
    tags: ["clothing", "preparation", "seasonal"],
    isActive: true
  },
  {
    question: "Is there a minimum age?",
    answer: "For paintball, the minimum age is 13 years old. For Gellyball, the minimum age is 6 years old. However, it's ultimately up to the parent to determine if their child is mature enough to handle the responsibilities that come along with playing. For kids under the recommended age, we recommend some type of private party to ensure that it is just your group playing with each other.",
    category: "age",
    order: 10,
    tags: ["age", "kids", "requirements"],
    isActive: true
  }
];

const seedContentBlocks = [
  {
    id: 'hero',
    section: 'hero',
    type: 'hero',
    title: 'We Bring The Action To You!',
    content: JSON.stringify({
      subtitle: 'Detroit\'s premier mobile paintball, gellyball, and entertainment service',
      backgroundImage: '/hero-bg.jpg'
    }),
    status: 'published',
    version: 1
  },
  {
    id: 'open-play',
    section: 'open-play',
    type: 'section',
    title: 'All Day Open Play',
    content: JSON.stringify({
      description: 'Join us Tuesdays only - $20 per player includes rental gear',
      timeSlots: ['12:00-2:00', '2:30-4:30', '5:00-7:00']
    }),
    status: 'published',
    version: 1
  },
  {
    id: 'footer',
    section: 'footer',
    type: 'footer',
    title: 'Footer Content',
    content: JSON.stringify({
      description: 'Detroit\'s premier mobile entertainment service bringing excitement to your doorstep.',
      phone: '(248) 660-0579',
      email: 'info@paintball2go.net',
      hours: 'Tuesday: 12:00 PM - 7:00 PM\nWednesday-Sunday: By Appointment\nMonday: Closed'
    }),
    status: 'published',
    version: 1
  }
];

const seedEmailTemplates = [
  {
    name: 'Welcome Email',
    subject: 'Welcome to Paintball 2 Go!',
    content: JSON.stringify({
      greeting: 'Welcome to the family!',
      message: 'Thank you for joining Paintball 2 Go. We\'re excited to bring the action to you!',
      cta: 'Book Your First Event'
    }),
    type: 'welcome',
    isActive: true,
    variables: ['name', 'email']
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await connectDB();

    // Clear existing data (optional - comment out in production)
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await FAQ.deleteMany({});
    await ContentBlock.deleteMany({});
    await EmailTemplate.deleteMany({});

    // Seed Users
    console.log('👥 Seeding users...');
    await User.insertMany(seedUsers);
    console.log(`✅ Created ${seedUsers.length} users`);

    // Seed FAQs
    console.log('❓ Seeding FAQs...');
    await FAQ.insertMany(seedFAQs);
    console.log(`✅ Created ${seedFAQs.length} FAQs`);

    // Seed Content Blocks
    console.log('📝 Seeding content blocks...');
    await ContentBlock.insertMany(seedContentBlocks);
    console.log(`✅ Created ${seedContentBlocks.length} content blocks`);

    // Seed Email Templates
    console.log('📧 Seeding email templates...');
    await EmailTemplate.insertMany(seedEmailTemplates);
    console.log(`✅ Created ${seedEmailTemplates.length} email templates`);

    console.log('🎉 Database seeding completed successfully!');

    // Display summary
    console.log('\n📊 Seeding Summary:');
    console.log(`👥 Users: ${seedUsers.length}`);
    console.log(`❓ FAQs: ${seedFAQs.length}`);
    console.log(`📝 Content Blocks: ${seedContentBlocks.length}`);
    console.log(`📧 Email Templates: ${seedEmailTemplates.length}`);

    console.log('\n🔑 Default Login Credentials:');
    console.log('Admin: admin@paintball2go.net / Admin123!');
    console.log('User: john@example.com / Password123!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('📴 Database connection closed');
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;