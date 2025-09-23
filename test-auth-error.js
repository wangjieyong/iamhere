const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAuthError() {
  try {
    console.log('=== Testing Auth Error Page ===');
    
    // Check if there's an error page
    const errorResponse = await fetch('http://localhost:3000/api/auth/error');
    console.log('Error page status:', errorResponse.status);
    
    const errorText = await errorResponse.text();
    console.log('Error page content:', errorText);
    
    // Also check the signin page for any error messages
    console.log('\n=== Checking Signin Page ===');
    const signinResponse = await fetch('http://localhost:3000/auth/signin');
    console.log('Signin page status:', signinResponse.status);
    
    // Try to directly call the authorize function
    console.log('\n=== Testing Direct Authorization ===');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      console.log('Testing user creation...');
      const devUser = await prisma.user.upsert({
        where: { email: "dev@example.com" },
        update: {},
        create: {
          id: "dev-user",
          name: "开发用户",
          email: "dev@example.com",
          image: null,
        }
      });
      
      console.log('✅ User created/found in database:', devUser);
    } catch (dbError) {
      console.log('❌ Database error:', dbError.message);
    } finally {
      await prisma.$disconnect();
    }
    
  } catch (error) {
    console.error('❌ Error testing auth:', error.message);
  }
}

testAuthError();