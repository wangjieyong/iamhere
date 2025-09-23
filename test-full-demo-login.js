const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testFullDemoLogin() {
  try {
    console.log('=== Testing Full Demo User Login Flow ===');
    
    // Step 1: Get CSRF token
    console.log('\n1. Getting CSRF token...');
    const csrfResponse = await fetch('http://localhost:3000/api/auth/csrf');
    const csrfData = await csrfResponse.json();
    console.log('CSRF token:', csrfData.csrfToken);
    
    // Step 2: Perform signin
    console.log('\n2. Performing signin...');
    const signinResponse = await fetch('http://localhost:3000/api/auth/signin/dev-skip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        csrfToken: csrfData.csrfToken,
        callbackUrl: 'http://localhost:3000/create',
        json: 'true'
      }),
      redirect: 'manual'
    });
    
    console.log('Signin response status:', signinResponse.status);
    console.log('Signin response headers:', Object.fromEntries(signinResponse.headers.entries()));
    
    const signinText = await signinResponse.text();
    console.log('Signin response body:', signinText);
    
    // Step 3: Check session
    console.log('\n3. Checking session...');
    const sessionResponse = await fetch('http://localhost:3000/api/auth/session');
    const sessionData = await sessionResponse.json();
    console.log('Session data:', JSON.stringify(sessionData, null, 2));
    
    if (sessionData.user) {
      console.log('✅ Demo user login successful!');
      console.log('User:', sessionData.user);
    } else {
      console.log('❌ Demo user login failed - no session');
    }
    
  } catch (error) {
    console.error('❌ Error testing demo login:', error.message);
  }
}

testFullDemoLogin();