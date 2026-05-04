const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'your_mongodb_uri_here';

async function makeAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    const result = await mongoose.connection.collection('users').updateOne(
      { email: 'wsdmpresh@gmail.com' },
      { $set: { isAdmin: true } }
    );
    console.log('Updated:', result.modifiedCount, 'user(s)');
    if (result.matchedCount === 0) {
      console.log('User not found! Check the email.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

makeAdmin();
