const dotenv = require('dotenv')
const mongoose = require('mongoose')
const connectDB = require('../config/database')
const PricingItem = require('../models/PricingItem')
const { StripeService } = require('../services/stripeService')

dotenv.config()

// Define catalog based on web pages (/membership, /pricing)
// Money amounts are in dollars (converted to cents for Stripe)
const catalog = [
  {
    key: 'membership_seasonal_10m',
    type: 'membership',
    name: 'Seasonal Membership Pass (10 Months)',
    description: 'Seasonal membership pass with exclusive perks',
    prices: [
      { key: 'one_time', amount: 140, currency: 'usd', interval: null },
    ],
    metadata: {
      perks: [
        '$7 discount on paintballs (per 2000 case)',
        'Free rental gear upgrades',
        "One (1) 'Bring-a-Friend' free play pass monthly",
        'Free water, candy, and chips coupons (limits apply)',
        'Discounted gameplay rate: $40 (regularly $45)',
        'Discounted rate on CO2/HPA tank fills'
      ]
    }
  },
  {
    key: 'party_paintball_package',
    type: 'package',
    name: 'Paintball Party Package',
    description: 'Up to 10 players · 2 hours · rentals · private field (if available) · staff',
    prices: [
      { key: 'one_time', amount: 450, currency: 'usd', interval: null },
    ]
  },
  {
    key: 'gellyball_onsite_package',
    type: 'package',
    name: 'GellyBall On-Site Package',
    description: 'Up to 12 players · 2 hours · inflatable arena · equipment',
    prices: [
      { key: 'one_time', amount: 400, currency: 'usd', interval: null },
    ]
  },
  {
    key: 'mobile_paintball_service',
    type: 'mobile_service',
    name: 'Mobile Paintball',
    description: 'We bring paintball to you · Up to 10 players · 2 hours',
    prices: [
      { key: 'one_time', amount: 575, currency: 'usd', interval: null },
    ]
  },
  {
    key: 'mobile_gellyball_service',
    type: 'mobile_service',
    name: 'Mobile GellyBall',
    description: 'We bring GellyBall to you · Up to 12 players · 2 hours',
    prices: [
      { key: 'one_time', amount: 475, currency: 'usd', interval: null },
    ]
  },
  // Consumables (no Stripe needed unless selling online)
  { key: 'paintballs_500', type: 'consumable', name: '500 Paintballs', prices: [{ key: 'one_time', amount: 25, currency: 'usd', interval: null }] },
  { key: 'paintballs_1500', type: 'consumable', name: '1500 Paintballs', prices: [{ key: 'one_time', amount: 60, currency: 'usd', interval: null }] },
  { key: 'paintballs_2000', type: 'consumable', name: '2000 Paintballs', prices: [{ key: 'one_time', amount: 75, currency: 'usd', interval: null }] },
]

async function ensureStripeProductAndPrices(item) {
  // Skip Stripe for consumables unless explicitly desired
  if (item.type === 'consumable') return { item, productId: null, priceMap: {} }

  const productRes = await StripeService.createProduct(item.name, item.description)
  if (!productRes.success) throw new Error(`Stripe product failed for ${item.key}: ${productRes.error?.message || productRes.error}`)
  const productId = productRes.product.id

  const priceMap = {}
  for (const price of item.prices) {
    const recurring = price.interval ? { interval: price.interval } : undefined
    const priceRes = await StripeService.createPrice(productId, price.amount, price.currency, recurring)
    if (!priceRes.success) throw new Error(`Stripe price failed for ${item.key}/${price.key}: ${priceRes.error?.message || priceRes.error}`)
    priceMap[price.key] = priceRes.price.id
  }

  return { item, productId, priceMap }
}

async function upsertPricingItem(dbItem, stripeInfo) {
  const prices = dbItem.prices.map(p => ({ ...p }))
  if (stripeInfo.productId) {
    dbItem.stripeProductId = stripeInfo.productId
  }
  for (const p of dbItem.prices) {
    const stripePriceId = stripeInfo.priceMap[p.key]
    if (stripePriceId) p.stripePriceId = stripePriceId
  }
  return PricingItem.findOneAndUpdate(
    { key: dbItem.key },
    { $set: { ...dbItem } },
    { upsert: true, new: true }
  )
}

async function seedPricing() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not set')
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set')

  await connectDB()

  try {
    console.log('🌱 Seeding pricing (Stripe + Mongo)...')

    for (const item of catalog) {
      console.log(`→ ${item.key}`)
      let stripeInfo = { item, productId: null, priceMap: {} }
      try {
        stripeInfo = await ensureStripeProductAndPrices(item)
      } catch (e) {
        console.warn(`Stripe skipped/failed for ${item.key}:`, e.message)
      }

      await upsertPricingItem({ ...item }, stripeInfo)
      console.log(`✓ Upserted ${item.key}`)
    }

    console.log('✅ Pricing seed completed')
  } catch (err) {
    console.error('❌ Pricing seed failed:', err)
  } finally {
    await mongoose.connection.close()
    console.log('📴 DB connection closed')
  }
}

if (require.main === module) {
  seedPricing()
}

module.exports = seedPricing


