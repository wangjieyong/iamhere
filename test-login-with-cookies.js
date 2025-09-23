const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testLoginWithCookies() {
  try {
    console.log('=== Testing Demo Login with Cookie Handling ===');
    
    // Cookie jar to store cookies
    let cookies = '';
    
    // Step 1: Get CSRF token
    console.log('\n1. Getting CSRF token...');
    const csrfResponse = await fetch('http://localhost:3000/api/auth/csrf');
    const csrfData = await csrfResponse.json();
    console.log('CSRF token:', csrfData.csrfToken);
    
    // Extract cookies from response
    const setCookieHeader = csrfResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      cookies = setCookieHeader.split(',').map(cookie => cookie.split(';')[0]).join('; ');
      console.log('Cookies from CSRF:', cookies);
    }
    
    // Step 2: Perform signin with cookies
    console.log('\n2. Performing signin with cookies...');
    const signinResponse = await fetch('http://localhost:3000/api/auth/signin/dev-skip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookies
      },
      body: new URLSearchParams({
        csrfToken: csrfData.csrfToken,
        callbackUrl: 'http://localhost:3000/create',
        json: 'true'
      }),
      redirect: 'manual'
    });
    
    console.log('Signin response status:', signinResponse.status);
    
    // Update cookies from signin response
    const signinSetCookie = signinResponse.headers.get('set-cookie');
    if (signinSetCookie) {
      const newCookies = signinSetCookie.split(',').map(cookie => cookie.split(';')[0]).join('; ');
      cookies = cookies ? `${cookies}; ${newCookies}` : newCookies;
      console.log('Updated cookies:', cookies);
    }
    
    const signinText = await signinResponse.text();
    console.log('Signin response body:', signinText);
    
    // Step 3: Check session with cookies
    console.log('\n3. Checking session with cookies...');
    const sessionResponse = await fetch('http://localhost:3000/api/auth/session', {
      headers: {
        'Cookie': cookies
      }
    });
    const sessionData = await sessionResponse.json();
    console.log('Session data:', JSON.stringify(sessionData, null, 2));
    
    if (sessionData.user) {
      console.log('✅ Demo user login successful!');
      console.log('User:', sessionData.user);
      
      // Step 4: Check if user was created in database
      console.log('\n4. Checking database...');
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: 'dev@example.com' }
        });
        
        if (dbUser) {
          console.log('✅ User found in database:', dbUser);
        } else {
          console.log('❌ User not found in database');
        }
      } catch (dbError) {
        console.log('Database check error:', dbError.message);
      } finally {
        await prisma.$disconnect();
      }
      
    } else {
      console.log('❌ Demo user login failed - no session');
    }
    
  } catch (error) {
    console.error('❌ Error testing demo login:', error.message);
  }
}

testLoginWithCookies();