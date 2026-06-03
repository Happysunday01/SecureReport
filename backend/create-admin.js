const db = require('./config/database');
const { hashPassword } = require('./utils/dbHelpers');

const getUserColumns = () => db.prepare('PRAGMA table_info(users)').all().map(col => col.name);

const createOrResetAdmin = async () => {
  try {
    const email = 'admin@securereport.com';
    const password = 'admin123';
    const hashedPassword = await hashPassword(password);
    const columns = getUserColumns();
    const hasVerified = columns.includes('verified');

    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (existing) {
      const updatePieces = [
        'password = ?',
        'role = ?',
        'department = ?',
        'active = 1',
        'approved = 1'
      ];
      if (hasVerified) updatePieces.push('verified = 1');

      const stmt = db.prepare(`UPDATE users SET ${updatePieces.join(', ')} WHERE email = ?`);
      const params = [hashedPassword, 'admin', 'IT', email];
      stmt.run(...params);

      console.log('✅ Existing admin user found and password reset.');
      console.log('   Email:', email);
      console.log('   Password:', password);
      return;
    }

    const insertColumns = ['email', 'password', 'name', 'role', 'department', 'active', 'approved'];
    const insertPlaceholders = ['?', '?', '?', '?', '?', '?', '?'];
    const insertValues = [email, hashedPassword, 'System Administrator', 'admin', 'IT', 1, 1];

    if (hasVerified) {
      insertColumns.push('verified');
      insertPlaceholders.push('?');
      insertValues.push(1);
    }

    const stmt = db.prepare(`INSERT INTO users (${insertColumns.join(', ')}) VALUES (${insertPlaceholders.join(', ')})`);
    const result = stmt.run(...insertValues);

    console.log('✅ Admin user created successfully!');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   ID:', result.lastInsertRowid);
    console.log('🎉 You can now login!');
  } catch (error) {
    console.error('❌ Error creating or resetting admin:', error.message);
    process.exit(1);
  }
};

createOrResetAdmin();
