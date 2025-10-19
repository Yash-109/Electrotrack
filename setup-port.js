#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get port from command line argument or default to 3000
const port = process.argv[2] || '3000';

// Read .env.local file
const envPath = path.join(__dirname, '.env.local');
let envContent = fs.readFileSync(envPath, 'utf8');

// Update NEXTAUTH_URL with the specified port
envContent = envContent.replace(
    /NEXTAUTH_URL=http:\/\/localhost:\d+/,
    `NEXTAUTH_URL=http://localhost:${port}`
);

// Write back to .env.local
fs.writeFileSync(envPath, envContent);

console.log(`✅ Updated NEXTAUTH_URL to http://localhost:${port}`);
console.log(`🚀 Now run: npx next dev -p ${port}`);
console.log(`📝 Make sure your Google Cloud Console has this redirect URL:`);
console.log(`   http://localhost:${port}/api/auth/callback/google`);
console.log(`\n⚠️  If you get 'redirect_uri_mismatch' error:`);
console.log(`   1. Go to: https://console.cloud.google.com/`);
console.log(`   2. APIs & Services → Credentials`);
console.log(`   3. Edit your OAuth client`);
console.log(`   4. Add: http://localhost:${port}/api/auth/callback/google`);
console.log(`   5. Save and try again`);
