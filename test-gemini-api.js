// 测试Gemini API的可用性
async function testGeminiAPI() {
  try {
    console.log('=== Testing Gemini API Availability ===');
    
    // 检查环境变量
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey ? apiKey.length : 0);
    console.log('API Key prefix:', apiKey ? apiKey.substring(0, 10) + '...' : 'None');
    
    // 检查是否为演示模式
    const isDemoMode = !apiKey || apiKey === "your-google-ai-api-key" || apiKey.length < 10;
    console.log('Demo mode would be:', isDemoMode);
    
    if (isDemoMode) {
      console.log('✅ Demo mode is enabled - image generation should work without authentication');
    } else {
      console.log('❌ Demo mode is disabled - image generation requires user authentication');
    }
    
    // 尝试导入和测试Gemini模块
    try {
      const { checkGeminiAvailability } = require('./src/lib/gemini.ts');
      console.log('\n=== Testing Gemini Module ===');
      
      const availability = await checkGeminiAvailability();
      console.log('Gemini availability:', availability);
      
    } catch (importError) {
      console.log('❌ Error importing Gemini module:', importError.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing Gemini API:', error.message);
  }
}

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

testGeminiAPI();