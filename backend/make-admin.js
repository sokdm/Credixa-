const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://daviddylan78778_db_user:bS5ekXxKJz0xjtre@studenthive.v6xwezd.mongodb.net/credixa?retryWrites=true&w=majority';

console.log('Connecting to MongoDB...');

async function makeAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');
    
    const result = await mongoose.connection.collection('users').updateOne(
      { email: 'wsdmpresh@gmail.com' },
      { $set: { isAdmin: true } }
    );
    
    console.log('Matched:', result.matchedCount);
    console.log('Modified:', result.modifiedCount);
    
    if (result.matchedCount === 0) {
      console.log('User not found! Available emails:');
      const users = await mongoose.connection.collection('users').find({}, { projection: { email: 1, fullName: 1 } }).limit(10).toArray();
      users.forEach(u => console.log(' -', u.email, '|', u.fullName));
    } else {
      const user = await mongoose.connection.collection('users').findOne({ email: 'wsdmpresh@gmail.com' });
      console.log('User isAdmin:', user.isAdmin);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

makeAdmin();
