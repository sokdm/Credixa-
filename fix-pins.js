const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb+srv://daviddylan78778_db_user:bS5ekXxKJz0xjtre@studenthive.v6xwezd.mongodb.net/credixa?retryWrites=true&w=majority';

async function fixPins() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const User = require('./backend/models/User');
    const users = await User.find({ transactionPin: { $exists: true } });

    for (const user of users) {
      if (user.transactionPin && !user.transactionPin.startsWith('$2')) {
        const hashedPin = await bcrypt.hash(user.transactionPin, 12);
        user.transactionPin = hashedPin;
        await user.save();
        console.log(`Fixed PIN for user: ${user.email}`);
      } else {
        console.log(`Skipped (already hashed): ${user.email}`);
      }
    }

    console.log('All PINs fixed!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixPins();
