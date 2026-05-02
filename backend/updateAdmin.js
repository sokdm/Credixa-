const mongoose = require('mongoose')
const User = require('./models/User')
require('dotenv').config()

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  // Delete old admin
  await User.deleteOne({ email: 'admin@credixa.com' })
  
  // Update existing user to be admin with new password
  const user = await User.findOne({ email: 'wsdmpresh@gmail.com' })
  
  if (user) {
    user.isAdmin = true
    user.password = 'Wisdomfx22a'
    await user.save()
    console.log('Existing user updated to admin:')
  } else {
    // Create new if somehow doesn't exist
    const newAdmin = new User({
      fullName: 'Admin',
      phoneNumber: '+2348000000000',
      email: 'wsdmpresh@gmail.com',
      password: 'Wisdomfx22a',
      country: 'Nigeria',
      transactionPin: '1234',
      accountNumber: '300000000001',
      balance: 0,
      isAdmin: true
    })
    await newAdmin.save()
    console.log('New admin created:')
  }
  
  console.log('Email: wsdmpresh@gmail.com')
  console.log('Password: Wisdomfx22a')
  process.exit(0)
}).catch(err => {
  console.error(err)
  process.exit(1)
})
