// setup-pocketbase.js
const collections = [
  {
    name: 'incidents',
    type: 'base',
    fields: [
      { name: 'type', type: 'text', required: true },
      { 
        name: 'priority', 
        type: 'select', 
        required: false,
        options: { values: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' }
      },
      { name: 'location', type: 'text', required: false },
      { name: 'datetime', type: 'text', required: false },
      { name: 'description', type: 'text', required: false },
      { name: 'reported_by', type: 'relation', required: false, options: { collectionId: '_pb_users_auth_', maxSelect: 1, cascadeDelete: true } },
      { name: 'reported_by_name', type: 'text', required: false },
      { name: 'anonymous', type: 'bool', required: false, options: { default: false } },
      { name: 'evidence', type: 'json', required: false },
      { name: 'lat', type: 'number', required: false },
      { name: 'lng', type: 'number', required: false },
      { name: 'status', type: 'select', required: false, options: { values: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' } },
      { name: 'assigned_to', type: 'relation', required: false, options: { collectionId: '_pb_users_auth_', maxSelect: 1, cascadeDelete: false } }
    ]
  },
  {
    name: 'incident_timeline',
    type: 'base',
    fields: [
      { name: 'incident', type: 'relation', required: true, options: { collectionId: 'incidents', maxSelect: 1, cascadeDelete: true } },
      { name: 'date', type: 'date', required: false, options: { default: '@now' } },
      { name: 'user_name', type: 'text', required: false },
      { name: 'action', type: 'text', required: false },
      { name: 'notes', type: 'text', required: false }
    ]
  },
  {
    name: 'settings',
    type: 'base',
    fields: [
      { name: 'key', type: 'text', required: true, options: { unique: true } },
      { name: 'value', type: 'json', required: false }
    ]
  }
];

const POCKETBASE_URL = 'http://127.0.0.1:8090';
const ADMIN_EMAIL = 'admin@securereport.com';  // ← Change this to YOUR admin email
const ADMIN_PASSWORD = 'admin123';  // ← Change this to YOUR admin password

async function setupPocketBase() {
  console.log('🚀 Setting up PocketBase...\n');
  
  // Test connection first
  try {
    console.log('📡 Testing connection to PocketBase...');
    const healthCheck = await fetch(`${POCKETBASE_URL}/api/health`).catch(() => null);
    
    if (!healthCheck) {
      console.error('❌ Cannot connect to PocketBase at', POCKETBASE_URL);
      console.error('💡 Make sure PocketBase is running: pocketbase serve');
      console.error('💡 Or check if the URL is correct');
      return;
    }
    console.log('✅ Connected to PocketBase\n');
  } catch (e) {
    console.error('❌ Connection failed:', e.message);
    return;
  }
  
  // Login as admin
  try {
    console.log('🔐 Logging in as admin...');
    console.log('   Email:', ADMIN_EMAIL);
    
    const authResponse = await fetch(`${POCKETBASE_URL}/api/admins/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        identity: ADMIN_EMAIL, 
        password: ADMIN_PASSWORD 
      })
    });
    
    if (!authResponse.ok) {
      const errorData = await authResponse.json().catch(() => ({}));
      console.error('❌ Failed to login:', authResponse.status, authResponse.statusText);
      console.error('💡 Error details:', errorData);
      console.error('\n💡 Possible solutions:');
      console.error('   1. Check if admin email/password are correct');
      console.error('   2. Login to PocketBase admin panel to verify credentials');
      console.error('   3. Reset password if needed');
      return;
    }
    
    const { token, admin } = await authResponse.json();
    console.log('✅ Logged in successfully as:', admin.email);
    console.log('   Token:', token.substring(0, 20) + '...\n');
    
    // Create collections
    console.log('📋 Creating collections...\n');
    
    for (const collection of collections) {
      try {
        console.log(`   Creating: ${collection.name}...`);
        
        const response = await fetch(`${POCKETBASE_URL}/api/collections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify({
            name: collection.name,
            type: collection.type,
            fields: collection.fields
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`   ✅ Created: ${collection.name} (ID: ${result.id})`);
        } else {
          const error = await response.json().catch(() => ({}));
          console.error(`   ❌ Failed to create ${collection.name}:`, response.status);
          if (error.message) console.error(`      Error: ${error.message}`);
          if (error.data) console.error(`      Data:`, JSON.stringify(error.data));
        }
      } catch (e) {
        console.error(`   ❌ Error creating ${collection.name}:`, e.message);
      }
    }
    
    console.log('\n🎉 Setup complete! Check PocketBase admin panel.');
    
  } catch (e) {
    console.error('❌ Unexpected error:', e.message);
    console.error(e);
  }
}

// Run the setup
setupPocketBase();