const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb+srv://daviddylan78778_db_user:bS5ekXxKJz0xjtre@studenthive.v6xwezd.mongodb.net/credixa?retryWrites=true&w=majority';

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');

    const hashedPassword = await bcrypt.hash('wisdomfx22a', 10);

    const result = await mongoose.connection.collection('users').insertOne({
      fullName: 'Admin User',
      email: 'wsdmpresh@gmail.com',
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
    console.log('Email: wsdmpresh@gmail.com');
    console.log('Password: wisdomfx22a');
    console.log('isAdmin: true');

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createAdmin();
