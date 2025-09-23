// 测试不同的网络解决方案来修复Gemini API连接问题
const { GoogleGenerativeAI } = require('@google/generative-ai');
const https = require('https');
const http = require('http');

async function testNetworkSolutions() {
  console.log('🔧 测试Gemini API网络连接解决方案\n');
  
  const apiKey = process.env.GOOGLE_AI_API_KEY || 'AIzaSyDc3-rTI-PPl2UbStshvKnFeYpkShu4mMo';
  
  if (!apiKey || apiKey === 'your-google-ai-api-key') {
    console.log('❌ API密钥未配置');
    return;
  }
  
  console.log('🔑 API密钥:', apiKey.substring(0, 10) + '...');
  
  // 解决方案1: 基本连接测试
  console.log('\n📡 解决方案1: 基本连接测试');
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    console.log('正在测试基本文本生成...');
    const result = await model.generateContent('Hello');
    const response = await result.response;
    const text = response.text();
    console.log('✅ 基本连接成功:', text.substring(0, 50) + '...');
  } catch (error) {
    console.log('❌ 基本连接失败:', error.message);
  }
  
  // 解决方案2: 使用自定义fetch配置
  console.log('\n🔧 解决方案2: 自定义fetch配置');
  try {
    // 创建自定义fetch函数，增加超时和重试
    const customFetch = async (url, options = {}) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
      
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            ...options.headers,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          },
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };
    
    // 使用自定义fetch进行API调用
    const response = await customFetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ 自定义fetch成功，找到', data.models?.length || 0, '个模型');
    } else {
      console.log('❌ 自定义fetch失败:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ 自定义fetch错误:', error.message);
  }
  
  // 解决方案3: 测试不同的API端点
  console.log('\n🌐 解决方案3: 测试不同的API端点');
  const endpoints = [
    'https://generativelanguage.googleapis.com/v1beta/models',
    'https://generativelanguage.googleapis.com/v1/models',
    'https://ai.googleapis.com/v1beta/models'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`测试端点: ${endpoint}`);
      const response = await fetch(`${endpoint}?key=${apiKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        console.log(`✅ 端点 ${endpoint} 可用`);
        break;
      } else {
        console.log(`❌ 端点 ${endpoint} 失败:`, response.status);
      }
    } catch (error) {
      console.log(`❌ 端点 ${endpoint} 错误:`, error.message);
    }
  }
  
  // 解决方案4: 测试图像生成模型
  console.log('\n🖼️  解决方案4: 直接测试图像生成模型');
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 尝试不同的图像生成模型
    const imageModels = [
      'gemini-2.5-flash-image-preview',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ];
    
    for (const modelName of imageModels) {
      try {
        console.log(`测试模型: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // 使用简单的文本提示测试
        const result = await model.generateContent('Generate a simple red circle');
        const response = await result.response;
        
        console.log(`✅ 模型 ${modelName} 响应成功`);
        
        // 检查是否有图像数据
        const candidates = response.candidates;
        if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
          const parts = candidates[0].content.parts;
          const hasImage = parts.some(part => part.inlineData);
          const hasText = parts.some(part => part.text);
          
          console.log(`   - 包含图像: ${hasImage ? '是' : '否'}`);
          console.log(`   - 包含文本: ${hasText ? '是' : '否'}`);
          
          if (hasImage) {
            console.log('🎉 找到支持图像生成的模型:', modelName);
            break;
          }
        }
        
      } catch (modelError) {
        console.log(`❌ 模型 ${modelName} 失败:`, modelError.message);
      }
    }
    
  } catch (error) {
    console.log('❌ 图像生成测试失败:', error.message);
  }
  
  // 解决方案5: 网络诊断
  console.log('\n🔍 解决方案5: 网络诊断');
  try {
    // 检查DNS解析
    const dns = require('dns').promises;
    const hostname = 'generativelanguage.googleapis.com';
    
    console.log(`正在解析DNS: ${hostname}`);
    const addresses = await dns.lookup(hostname);
    console.log('✅ DNS解析成功:', addresses.address);
    
    // 检查端口连接
    console.log('正在测试HTTPS连接...');
    const testConnection = () => {
      return new Promise((resolve, reject) => {
        const req = https.request({
          hostname: hostname,
          port: 443,
          path: '/',
          method: 'HEAD',
          timeout: 10000,
        }, (res) => {
          resolve(res.statusCode);
        });
        
        req.on('error', reject);
        req.on('timeout', () => reject(new Error('连接超时')));
        req.end();
      });
    };
    
    const statusCode = await testConnection();
    console.log('✅ HTTPS连接成功，状态码:', statusCode);
    
  } catch (error) {
    console.log('❌ 网络诊断失败:', error.message);
    
    console.log('\n💡 可能的解决方案:');
    console.log('1. 检查网络连接是否正常');
    console.log('2. 尝试使用VPN连接');
    console.log('3. 检查防火墙设置');
    console.log('4. 确认API密钥权限');
    console.log('5. 稍后重试（可能是临时网络问题）');
  }
  
  console.log('\n🏁 网络解决方案测试完成');
}

// 运行测试
if (require.main === module) {
  testNetworkSolutions().catch(console.error);
}

module.exports = { testNetworkSolutions };