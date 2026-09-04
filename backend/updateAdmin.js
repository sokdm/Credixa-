const mongoose = require('mongoose')
const User = require('./models/User')
require('dotenv').config()

const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required')
  // Delete old admin
  await User.deleteOne({ email: process.env.LEGACY_ADMIN_EMAIL || 'admin@credixa.com' })
  
  // Update existing user to be admin with new password
  const user = await User.findOne({ email: ADMIN_EMAIL })
  
  if (user) {
    user.isAdmin = true
    user.password = ADMIN_PASSWORD
    await user.save()
    console.log('Existing user updated to admin:')
  } else {
    // Create new if somehow doesn't exist
    const newAdmin = new User({
      fullName: 'Admin',
      phoneNumber: '+2348000000000',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      country: 'Nigeria',
      transactionPin: '1234',
      accountNumber: '300000000001',
      balance: 0,
      isAdmin: true
    })
    await newAdmin.save()
    console.log('New admin created:')
  }
  
  console.log('Admin credentials were supplied through environment variables')
  process.exit(0)
}).catch(err => {
  console.error(err)
  process.exit(1)
})
