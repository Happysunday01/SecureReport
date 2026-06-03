const db = require('./config/database');
const { hashPassword } = require('./utils/dbHelpers');

const resetPassword = async () => {
  try {
    const email = 'admin@securereport.com';
    const newPassword = process.argv[2] || 'admin123';
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!existing) {
      console.error('❌ Admin user not found:', email);
      process.exit(1);
    }

    const hashedPassword = await hashPassword(newPassword);

    db.prepare('UPDATE users SET password = ?, active = 1, approved = 1 WHERE email = ?').run(hashedPassword, email);

    console.log('✅ Admin password reset successfully!');
    console.log('   Email:', email);
    console.log('   New password:', newPassword);
    console.log('   Active: true');
    console.log('   Approved: true');
    console.log('🎉 You can now login with the new credentials.');
  } catch (error) {
    console.error('❌ Error resetting admin password:', error.message);
    process.exit(1);
  }
};

resetPassword();
