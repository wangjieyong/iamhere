require('dotenv').config({ path: '.env.local' });

console.log('=== Google OAuth Configuration Test ===');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set');

console.log('\n=== Expected Redirect URI ===');
console.log('Should be configured in Google Cloud Console:');
console.log(`${process.env.NEXTAUTH_URL}/api/auth/callback/google`);

console.log('\n=== Testing Google OAuth Endpoint ===');
const https = require('https');

const testGoogleOAuth = () => {
  const options = {
    hostname: 'accounts.google.com',
    port: 443,
    path: '/.well-known/openid_configuration',
    method: 'GET',
    timeout: 5000
  };

  const req = https.request(options, (res) => {
    console.log('Google OAuth endpoint status:', res.statusCode);
    if (res.statusCode === 200) {
      console.log('✅ Google OAuth endpoint is accessible');
    } else {
      console.log('❌ Google OAuth endpoint returned error');
    }
  });

  req.on('error', (err) => {
    console.log('❌ Error connecting to Google OAuth:', err.message);
  });

  req.on('timeout', () => {
    console.log('❌ Timeout connecting to Google OAuth');
    req.destroy();
  });

  req.end();
};

testGoogleOAuth();