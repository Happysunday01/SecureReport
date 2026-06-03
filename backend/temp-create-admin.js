
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Hashed password:', hashedPassword);
    
    // Create admin
    const admin = await User.create({
      email: 'admin@securereport.com',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'admin',
      department: 'IT',
      active: true,
      approved: true,
      verified: true
    });
    
    console.log('✅ Admin created!');
    console.log('Email:', admin.email);
    console.log('Password to use: admin123');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();