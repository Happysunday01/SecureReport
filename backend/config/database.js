// backend/config/database.js
const Database = require('better-sqlite3');
const path = require('path');

// Create database file in project root
const dbPath = path.join(__dirname, '../secureReport.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'security', 'coordinator', 'admin')),
    department TEXT,
    active INTEGER DEFAULT 1,
    approved INTEGER DEFAULT 0,
    verified INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  -- Incidents table
  CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    priority TEXT DEFAULT 'Medium' CHECK(priority IN ('Low', 'Medium', 'High', 'Critical')),
    location TEXT,
    datetime TEXT,
    description TEXT,
    reportedBy INTEGER NOT NULL,
    reportedByName TEXT NOT NULL,
    anonymous INTEGER DEFAULT 0,
    evidence TEXT,
    lat REAL,
    lng REAL,
    status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'In Progress', 'Resolved')),
    assignedTo INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reportedBy) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assignedTo) REFERENCES users(id)
  );
  
  -- Timeline table
  CREATE TABLE IF NOT EXISTS timeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incidentId INTEGER NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    userName TEXT NOT NULL,
    action TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (incidentId) REFERENCES incidents(id) ON DELETE CASCADE
  );
  
  -- Settings table
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL
  );
  
  -- Create indexes for faster queries
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_incidents_reportedBy ON incidents(reportedBy);
  CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
  CREATE INDEX IF NOT EXISTS idx_timeline_incidentId ON timeline(incidentId);
`);

console.log('✅ SQLite database initialized at:', dbPath);

module.exports = db;