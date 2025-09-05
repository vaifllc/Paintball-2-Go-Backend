"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("../models/User"));
const FAQ_1 = __importDefault(require("../models/FAQ"));
const ContentBlock_1 = __importDefault(require("../models/ContentBlock"));
const EmailTemplate_1 = __importDefault(require("../models/EmailTemplate"));
dotenv_1.default.config();
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
    },
    {
        question: "Do I need a waiver if I'm bringing someone else's child?",
        answer: "Every player must sign an electronic waiver upon arrival to the park. If under 18, a parent or guardian can sign the waiver online in advance for their child. If you brought someone else's child to the park, we recommend you make sure their parent has signed the online waiver before arrival.",
        category: "waiver",
        order: 11,
        tags: ["waiver", "kids", "legal"],
        isActive: true
    },
    {
        question: "Can I bring a book bag or duffle bag?",
        answer: "Yes, book bags and duffel bags are allowed. However, we are not responsible for lost or stolen items.",
        category: "preparation",
        order: 12,
        tags: ["bags", "preparation", "policy"],
        isActive: true
    },
    {
        question: "What is Gellyball?",
        answer: "GellyBall is an ultra low impact sport – suitable for kids age four and up. It uses GellyBall blasters – an easy-to-use gun that doesn't use much pressure to shoot GellyBalls. Unlike Nerf – where you have to constantly reload with ammo.",
        category: "gellyball",
        order: 13,
        tags: ["gellyball", "kids", "low-impact"],
        isActive: true
    },
    {
        question: "What activities do you offer?",
        answer: "We offer multiple exciting activities including Paintball (ages 13+), Gellyball (ages 6+), Archery Tag (ages 10+), Axe Throwing (ages 18+), and Cornhole (all ages). Each activity comes with professional equipment and trained staff to ensure a safe and fun experience.",
        category: "activities",
        order: 14,
        tags: ["activities", "ages", "options"],
        isActive: true
    },
    {
        question: "Do you provide mobile services?",
        answer: "Yes! We are a mobile entertainment service. We bring all the equipment and set up the activity at your location. We can come to your home, park, or event venue. We also have the option for you to come to our facility for certain activities.",
        category: "services",
        order: 15,
        tags: ["mobile", "services", "location"],
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
    },
    {
        id: 'booking-cta',
        section: 'booking-cta',
        type: 'cta',
        title: 'Ready to Book Your Event?',
        content: JSON.stringify({
            description: 'Check availability, select your activity, and book your event online. Or we\'ll bring the fun to you!',
            buttonText: 'Book Now'
        }),
        status: 'published',
        version: 1
    },
    {
        id: 'activities',
        section: 'activities',
        type: 'section',
        title: 'Our Activities',
        content: JSON.stringify({
            description: 'Choose from our range of exciting mobile activities that we bring directly to your location.'
        }),
        status: 'published',
        version: 1
    },
    {
        id: 'event-types',
        section: 'event-types',
        type: 'section',
        title: 'Perfect for Any Event',
        content: JSON.stringify({
            description: 'From birthday parties to corporate team building events, we make every occasion special.',
            bookingInfo: 'Ready to create lasting memories? **Book your adventure today!**'
        }),
        status: 'published',
        version: 1
    },
    {
        id: 'reviews',
        section: 'reviews',
        type: 'section',
        title: 'What Our Customers Say',
        content: JSON.stringify({
            description: 'Don\'t just take our word for it - hear from our satisfied customers!'
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
    },
    {
        name: 'Booking Confirmation',
        subject: 'Booking Confirmed - {{activityType}} on {{date}}',
        content: JSON.stringify({
            greeting: 'Your booking is confirmed!',
            message: 'We\'re excited to bring {{activityType}} to you on {{date}}.',
            details: 'Booking details are included below.',
            reminder: 'Don\'t forget to complete your waiver!'
        }),
        type: 'booking_confirmation',
        isActive: true,
        variables: ['name', 'activityType', 'date', 'time', 'location', 'participants', 'totalAmount']
    },
    {
        name: 'Payment Confirmation',
        subject: 'Payment Confirmed - ${{amount}}',
        content: JSON.stringify({
            greeting: 'Payment received!',
            message: 'Your payment of ${{amount}} has been successfully processed.',
            receipt: 'Keep this email as your receipt.'
        }),
        type: 'payment_confirmation',
        isActive: true,
        variables: ['name', 'amount', 'transactionId', 'description']
    },
    {
        name: 'Waiver Reminder',
        subject: 'Complete Your Waiver - Event Tomorrow',
        content: JSON.stringify({
            greeting: 'Don\'t forget your waiver!',
            message: 'Your event is tomorrow. Please complete your waiver to ensure a smooth check-in.',
            cta: 'Complete Waiver Now'
        }),
        type: 'waiver_reminder',
        isActive: true,
        variables: ['name', 'activityType', 'date']
    },
    {
        name: 'Password Reset',
        subject: 'Password Reset Request',
        content: JSON.stringify({
            greeting: 'Password reset requested',
            message: 'Click the link below to reset your password. This link expires in 1 hour.',
            security: 'If you didn\'t request this, please ignore this email.'
        }),
        type: 'password_reset',
        isActive: true,
        variables: ['name', 'resetToken']
    }
];
async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');
        await (0, database_1.default)();
        console.log('🧹 Clearing existing data...');
        await User_1.default.deleteMany({});
        await FAQ_1.default.deleteMany({});
        await ContentBlock_1.default.deleteMany({});
        await EmailTemplate_1.default.deleteMany({});
        console.log('👥 Seeding users...');
        await User_1.default.insertMany(seedUsers);
        console.log(`✅ Created ${seedUsers.length} users`);
        console.log('❓ Seeding FAQs...');
        await FAQ_1.default.insertMany(seedFAQs);
        console.log(`✅ Created ${seedFAQs.length} FAQs`);
        console.log('📝 Seeding content blocks...');
        await ContentBlock_1.default.insertMany(seedContentBlocks);
        console.log(`✅ Created ${seedContentBlocks.length} content blocks`);
        console.log('📧 Seeding email templates...');
        await EmailTemplate_1.default.insertMany(seedEmailTemplates);
        console.log(`✅ Created ${seedEmailTemplates.length} email templates`);
        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📊 Seeding Summary:');
        console.log(`👥 Users: ${seedUsers.length}`);
        console.log(`❓ FAQs: ${seedFAQs.length}`);
        console.log(`📝 Content Blocks: ${seedContentBlocks.length}`);
        console.log(`📧 Email Templates: ${seedEmailTemplates.length}`);
        console.log('\n🔑 Default Login Credentials:');
        console.log('Admin: admin@paintball2go.net / Admin123!');
        console.log('User: john@example.com / Password123!');
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
    }
    finally {
        await mongoose_1.default.connection.close();
        console.log('📴 Database connection closed');
    }
}
if (require.main === module) {
    seedDatabase();
}
exports.default = seedDatabase;
//# sourceMappingURL=seed.js.map