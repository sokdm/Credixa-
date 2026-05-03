const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://daviddylan78778_db_user:bS5ekXxKJz0xjtre@studenthive.v6xwezd.mongodb.net/?appName=Studenthive';

async function makeAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const User = require('./models/User');
    
    // Find user by email and make admin
    const email = process.argv[2];
    if (!email) {
      console.log('Usage: node makeAdmin.js <email>');
      console.log('Example: node makeAdmin.js user@example.com');
      process.exit(1);
    }
    
    const user = await User.findOneAndUpdate(
      { email },
      { isAdmin: true },
      { new: true }
    );
    
    if (!user) {
      console.log('User not found:', email);
      process.exit(1);
    }
    
    console.log('Success! User is now admin:');
    console.log('  Name:', user.fullName);
    console.log('  Email:', user.email);
    console.log('  isAdmin:', user.isAdmin);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

makeAdmin();
