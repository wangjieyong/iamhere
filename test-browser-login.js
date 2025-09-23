const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testBrowserLogin() {
  try {
    console.log('=== Testing Browser-like Login ===');
    
    // Step 1: Visit the signin page first
    console.log('\n1. Visiting signin page...');
    const signinPageResponse = await fetch('http://localhost:3000/auth/signin');
    console.log('Signin page status:', signinPageResponse.status);
    
    // Step 2: Get CSRF token
    console.log('\n2. Getting CSRF token...');
    const csrfResponse = await fetch('http://localhost:3000/api/auth/csrf');
    const csrfData = await csrfResponse.json();
    console.log('CSRF token:', csrfData.csrfToken);
    
    // Step 3: Perform signin with form data (like a browser would)
    console.log('\n3. Performing signin...');
    const formData = new URLSearchParams();
    formData.append('csrfToken', csrfData.csrfToken);
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
    
    // Step 4: Follow redirect if any
    const location = signinResponse.headers.get('location');
    if (location) {
      console.log('\n4. Following redirect to:', location);
      const redirectResponse = await fetch(location, {
        redirect: 'manual'
      });
      console.log('Redirect response status:', redirectResponse.status);
      
      const redirectText = await redirectResponse.text();
      console.log('Redirect response body (first 500 chars):', redirectText.substring(0, 500));
    }
    
  } catch (error) {
    console.error('❌ Error testing browser login:', error.message);
  }
}

testBrowserLogin();