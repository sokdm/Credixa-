const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './backend/.env' });

const MONGO_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function createAdmin() {
  try {
    if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error('MONGODB_URI, ADMIN_EMAIL, and ADMIN_PASSWORD are required');
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const result = await mongoose.connection.collection('users').insertOne({
      fullName: 'Admin User',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      isAdmin: true,
      isActive: true,
      isLocked: false,
      balance: 0,
      currency: '$',
      accountNumber: 'ADM' + Math.floor(1000000000 + Math.random() * 9000000000).toString(),
      phoneNumber: '',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Admin user created with ID:', result.insertedId);
    console.log('Admin credentials were supplied through environment variables.');
    console.log('isAdmin: true');

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createAdmin();
