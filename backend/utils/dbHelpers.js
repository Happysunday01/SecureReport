// backend/utils/dbHelpers.js
const bcrypt = require('bcryptjs');

// Helper to hash password
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Helper to compare password
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Helper to convert row to object
function rowToObject(row) {
  if (!row) return null;
  const obj = {};
  for (const key in row) {
    if (key !== 'password') {
      obj[key] = row[key];
    }
  }
  // Convert INTEGER booleans to actual booleans
  if (obj.active !== undefined) obj.active = Boolean(obj.active);
  if (obj.approved !== undefined) obj.approved = Boolean(obj.approved);
  if (obj.verified !== undefined) obj.verified = Boolean(obj.verified);
  if (obj.anonymous !== undefined) obj.anonymous = Boolean(obj.anonymous);
  return obj;
}

// Helper to parse JSON evidence
function parseEvidence(evidence) {
  if (!evidence) return null;
  try {
    return JSON.parse(evidence);
  } catch {
    return evidence;
  }
}

module.exports = {
  hashPassword,
  comparePassword,
  rowToObject,
  parseEvidence
};