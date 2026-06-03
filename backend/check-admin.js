
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/secureReport');
    console.log('✅ Connected to MongoDB\n');
    
    // Get the User model with password visible
    const User = require('./models/User');
    
    // Find admin with password included
    const admin = await User.findOne({ email: 'admin@securereport.com' }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin user NOT found in database!');
      mongoose.connection.close();
      return;
    }
    
    console.log('📋 Admin User Found:');
    console.log('   ID:', admin._id);
    console.log('   Email:', admin.email);
    console.log('   Name:', admin.name);
    console.log('   Role:', admin.role);
    console.log('   Active:', admin.active);
    console.log('   Approved:', admin.approved);
    console.log('   Verified:', admin.verified);
    console.log('   Password (hashed):', admin.password?.substring(0, 30) + '...');
    console.log('');
    
    // Test password comparison
    const testPassword = 'admin123';
    const isMatch = await admin.comparePassword(testPassword);
    console.log('🔐 Password Test:');
    console.log('   Testing password:', testPassword);
    console.log('   Match result:', isMatch ? '✅ YES' : '❌ NO');
    console.log('');
    
    if (!isMatch) {
      console.log('💡 The password in database does NOT match "admin123"');
      console.log('💡 Possible causes:');
      console.log('   1. Password was set differently when user was created');
      console.log('   2. Password hashing failed during creation');
      console.log('   3. User was created with a different password');
      console.log('');
      console.log('🔧 To fix: Run reset-admin-password.js (see below)');
    }
    
    mongoose.connection.close();
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

checkAdmin();