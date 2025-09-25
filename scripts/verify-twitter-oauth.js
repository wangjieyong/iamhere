#!/usr/bin/env node

/**
 * Twitter OAuth Configuration Verification Script
 * 
 * This script verifies that Twitter OAuth is properly configured for the IAmHere application.
 * It checks environment variables, NextAuth configuration, and UI implementation.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Twitter OAuth Configuration Verification\n');

// Check environment variables
console.log('📋 Checking Environment Variables...');
const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

const requiredEnvVars = [
  'TWITTER_CLIENT_ID',
  'TWITTER_CLIENT_SECRET'
];

const envStatus = {};

requiredEnvVars.forEach(varName => {
  const line = envLines.find(line => line.startsWith(`${varName}=`));
  if (line) {
    const value = line.split('=')[1]?.replace(/"/g, '');
    if (value && value !== `your-twitter-${varName.toLowerCase().replace('twitter_', '').replace('_', '-')}`) {
      envStatus[varName] = '✅ Configured';
    } else {
      envStatus[varName] = '⚠️  Using placeholder value';
    }
  } else {
    envStatus[varName] = '❌ Not found';
  }
});

Object.entries(envStatus).forEach(([key, status]) => {
  console.log(`  ${key}: ${status}`);
});

const allEnvConfigured = Object.values(envStatus).every(status => status === '✅ Configured');

// Check NextAuth configuration
console.log('\n🔧 Checking NextAuth Configuration...');
const authConfigPath = path.join(process.cwd(), 'src', 'lib', 'auth.ts');

if (!fs.existsSync(authConfigPath)) {
  console.log('❌ NextAuth configuration file not found');
  process.exit(1);
}

const authContent = fs.readFileSync(authConfigPath, 'utf8');

if (authContent.includes('TwitterProvider')) {
  console.log('  ✅ Twitter provider imported');
} else {
  console.log('  ❌ Twitter provider not imported');
}

if (authContent.includes('TWITTER_CLIENT_ID') && authContent.includes('TWITTER_CLIENT_SECRET')) {
  console.log('  ✅ Twitter provider configured with environment variables');
} else {
  console.log('  ❌ Twitter provider not properly configured');
}

// Check sign-in page implementation
console.log('\n🎨 Checking Sign-in Page Implementation...');
const signinPagePath = path.join(process.cwd(), 'src', 'app', 'auth', 'signin', 'page.tsx');

if (!fs.existsSync(signinPagePath)) {
  console.log('❌ Sign-in page not found');
  process.exit(1);
}

const signinContent = fs.readFileSync(signinPagePath, 'utf8');

if (signinContent.includes('handleTwitterSignIn')) {
  console.log('  ✅ Twitter sign-in handler implemented');
} else {
  console.log('  ❌ Twitter sign-in handler not found');
}

if (signinContent.includes('使用 Twitter 登录')) {
  console.log('  ✅ Twitter sign-in button text found');
} else {
  console.log('  ❌ Twitter sign-in button text not found');
}

if (signinContent.includes('isTwitterLoading')) {
  console.log('  ✅ Twitter loading state implemented');
} else {
  console.log('  ❌ Twitter loading state not found');
}

// Check for Twitter-specific styling
if (signinContent.includes('#1DA1F2')) {
  console.log('  ✅ Twitter brand colors applied');
} else {
  console.log('  ❌ Twitter brand colors not found');
}

// Summary
console.log('\n📊 Configuration Summary:');
const authConfigured = authContent.includes('TwitterProvider') && 
                      authContent.includes('TWITTER_CLIENT_ID');
const uiImplemented = signinContent.includes('handleTwitterSignIn') && 
                     signinContent.includes('使用 Twitter 登录');

if (allEnvConfigured && authConfigured && uiImplemented) {
  console.log('🎉 Twitter OAuth is fully configured and ready to use!');
  console.log('\n📝 Next Steps:');
  console.log('1. Make sure you have configured Twitter App in Twitter Developer Portal');
  console.log('2. Update TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET with real values');
  console.log('3. Test the Twitter login functionality');
  console.log('4. Configure callback URLs for production environment');
} else {
  console.log('⚠️  Twitter OAuth configuration is incomplete:');
  if (!allEnvConfigured) {
    console.log('   - Environment variables need to be configured');
  }
  if (!authConfigured) {
    console.log('   - NextAuth configuration needs Twitter provider');
  }
  if (!uiImplemented) {
    console.log('   - Sign-in page needs Twitter login implementation');
  }
  console.log('\n📖 Please refer to TWITTER_OAUTH_SETUP.md for detailed setup instructions');
}

console.log('\n🔗 Useful Links:');
console.log('- Twitter Developer Portal: https://developer.twitter.com/');
console.log('- NextAuth.js Twitter Provider: https://next-auth.js.org/providers/twitter');
console.log('- Setup Guide: ./TWITTER_OAUTH_SETUP.md');
console.log('- Twitter API Documentation: https://developer.twitter.com/en/docs');