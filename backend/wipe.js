const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// We have to require models AFTER connecting, or just require them directly.
dotenv.config();

const wipeAndSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB. Wiping collections...');
    
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.drop();
      console.log(`Dropped ${collection.collectionName}`);
    }

    const User = require('./models/User');

    // Create Super Admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    await User.create({
      name: 'Super Admin',
      email: 'superadmin@erp.com',
      password: hashedPassword,
      role: 'super_admin'
    });

    console.log('Created superadmin@erp.com / 123456');
    console.log('Database wiped and seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

wipeAndSeed();
