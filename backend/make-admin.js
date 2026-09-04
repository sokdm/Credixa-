const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

console.log('Connecting to MongoDB...');

async function makeAdmin() {
  try {
    if (!MONGO_URI || !ADMIN_EMAIL) throw new Error('MONGODB_URI and ADMIN_EMAIL are required');
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');
    
    const result = await mongoose.connection.collection('users').updateOne(
      { email: ADMIN_EMAIL },
      { $set: { isAdmin: true } }
    );
    
    console.log('Matched:', result.matchedCount);
    console.log('Modified:', result.modifiedCount);
    
    if (result.matchedCount === 0) {
      console.log('User not found! Available emails:');
      const users = await mongoose.connection.collection('users').find({}, { projection: { email: 1, fullName: 1 } }).limit(10).toArray();
      users.forEach(u => console.log(' -', u.email, '|', u.fullName));
    } else {
      const user = await mongoose.connection.collection('users').findOne({ email: ADMIN_EMAIL });
      console.log('User isAdmin:', user.isAdmin);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

makeAdmin();
