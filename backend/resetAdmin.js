const mongoose = require('mongoose')
const User = require('./models/User')
require('dotenv').config()

const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required')

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  // Delete ALL users (careful - only for dev!)
  await User.deleteMany({})
  
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
  console.log('Admin created:')
  console.log('Admin credentials were supplied through environment variables')
  process.exit(0)
}).catch(err => {
  console.error(err)
  process.exit(1)
})
