const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testLoginWithUsername() {
  try {
    console.log('=== Testing Login with Username ===');
    
    // Step 1: Get CSRF token
    console.log('\n1. Getting CSRF token...');
    const csrfResponse = await fetch('http://localhost:3000/api/auth/csrf');
    const csrfData = await csrfResponse.json();
    console.log('CSRF token:', csrfData.csrfToken);
    
    // Step 2: Perform signin with username
    console.log('\n2. Performing signin with username...');
    const formData = new URLSearchParams();
    formData.append('csrfToken', csrfData.csrfToken);
    formData.append('username', 'dev');
    formData.append('callbackUrl', 'http://localhost:3000/create');
    
    const signinResponse = await fetch('http://localhost:3000/api/auth/signin/dev-skip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
      redirect: 'manual'
    });
    
    console.log('Signin response status:', signinResponse.status);
    console.log('Signin response headers:', Object.fromEntries(signinResponse.headers.entries()));
    
    const signinText = await signinResponse.text();
    console.log('Signin response body:', signinText);
    
    // Step 3: Follow redirect if successful
    const location = signinResponse.headers.get('location');
    if (location) {
      console.log('\n3. Following redirect to:', location);
      
      // Extract cookies for session check
      const setCookieHeader = signinResponse.headers.get('set-cookie');
      let cookies = '';
      if (setCookieHeader) {
        cookies = setCookieHeader.split(',').map(cookie => cookie.split(';')[0]).join('; ');
        console.log('Cookies:', cookies);
      }
      
      // Check session
      console.log('\n4. Checking session...');
      const sessionResponse = await fetch('http://localhost:3000/api/auth/session', {
        headers: {
          'Cookie': cookies
        }
      });
      const sessionData = await sessionResponse.json();
      console.log('Session data:', JSON.stringify(sessionData, null, 2));
      
      if (sessionData.user) {
        console.log('✅ Demo user login successful!');
      } else {
        console.log('❌ Demo user login failed - no session');
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing login:', error.message);
  }
}

testLoginWithUsername();