#!/usr/bin/env node

// Utility script to generate bcrypt hashes for admin passwords
// Usage: node scripts/hash-password.js your-password

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
    console.error('Usage: node scripts/hash-password.js <password>');
    process.exit(1);
}

const saltRounds = 10;
const hash = bcrypt.hashSync(password, saltRounds);

console.log('Password:', password);
console.log('Bcrypt Hash:', hash);
console.log('\nAdd this to your .env.local file:');
console.log(`ADMIN_PASSWORD_1=${hash}`);
console.log('\n⚠️  Keep this hash secure and never commit it to version control!');
