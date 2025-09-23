const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testDemoLogin() {
  try {
    console.log('=== Testing Demo User Login ===');
    
    // Test the dev-skip signin endpoint
    const response = await fetch('http://localhost:3000/api/auth/signin/dev-skip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        callbackUrl: '/create',
        redirect: false
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Demo login endpoint is working');
    } else {
      console.log('❌ Demo login endpoint failed');
    }
    
  } catch (error) {
    console.error('❌ Error testing demo login:', error.message);
  }
}

testDemoLogin();