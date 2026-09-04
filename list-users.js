const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const MONGO_URI = process.env.MONGODB_URI;

async function listUsers() {
  try {
    if (!MONGO_URI) throw new Error('MONGODB_URI is required');
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');
    
    const users = await mongoose.connection.collection('users').find({}, { projection: { email: 1, fullName: 1, isAdmin: 1 } }).toArray();
    
    console.log('\nTotal users:', users.length);
    console.log('\nAll users:');
    users.forEach((u, i) => {
      console.log(`${i + 1}. ${u.email} | ${u.fullName || 'N/A'} | isAdmin: ${u.isAdmin || false}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

listUsers();
