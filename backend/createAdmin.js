const mongoose = require('mongoose')
const User = require('./models/User')
require('dotenv').config()

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const admin = new User({
    fullName: 'Admin',
    phoneNumber: '+2348000000000',
    email: 'admin@credixa.com',
    password: 'admin123',
    country: 'Nigeria',
    transactionPin: '1234',
    accountNumber: '300000000001',
    balance: 0,
    isAdmin: true
  })
  await admin.save()
  console.log('Admin created: admin@credixa.com / admin123')
  process.exit(0)
}).catch(err => {
  console.error(err)
  process.exit(1)
})
