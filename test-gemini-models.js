// 测试Google AI API的可用模型
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiModels() {
  console.log('🔍 测试Google AI API的可用模型\n');
  
  const apiKey = process.env.GOOGLE_AI_API_KEY || 'AIzaSyDc3-rTI-PPl2UbStshvKnFeYpkShu4mMo';
  
  if (!apiKey || apiKey === 'your-google-ai-api-key') {
    console.log('❌ API密钥未配置');
    return;
  }
  
  console.log('🔑 API密钥:', apiKey.substring(0, 10) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log('📡 正在获取可用模型列表...');
    
    // 尝试获取模型列表
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    if (!response.ok) {
      console.log('❌ API调用失败:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('错误详情:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API调用成功！');
    
    if (data.models && data.models.length > 0) {
      console.log(`\n📋 可用模型 (${data.models.length}个):`);
      
      data.models.forEach((model, index) => {
        console.log(`${index + 1}. ${model.name}`);
        console.log(`   显示名称: ${model.displayName || 'N/A'}`);
        console.log(`   描述: ${model.description || 'N/A'}`);
        console.log(`   支持的方法: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
        console.log('');
      });
      
      // 查找图像生成相关的模型
      console.log('🖼️  图像生成相关模型:');
      const imageModels = data.models.filter(model => 
        model.name.toLowerCase().includes('image') ||
        model.name.toLowerCase().includes('vision') ||
        model.displayName?.toLowerCase().includes('image') ||
        model.description?.toLowerCase().includes('image')
      );
      
      if (imageModels.length > 0) {
        imageModels.forEach(model => {
          console.log(`✅ ${model.name} - ${model.displayName}`);
        });
      } else {
        console.log('❌ 未找到明确的图像生成模型');
        console.log('💡 尝试使用通用模型进行图像生成...');
        
        // 显示支持generateContent的模型
        const contentModels = data.models.filter(model => 
          model.supportedGenerationMethods?.includes('generateContent')
        );
        
        console.log('\n📝 支持内容生成的模型:');
        contentModels.forEach(model => {
          console.log(`- ${model.name}`);
        });
      }
      
    } else {
      console.log('❌ 未找到可用模型');
    }
    
    // 测试一个简单的文本生成
    console.log('\n🧪 测试文本生成功能...');
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent('Hello, how are you?');
      const response = await result.response;
      const text = response.text();
      console.log('✅ 文本生成成功:', text.substring(0, 100) + '...');
    } catch (textError) {
      console.log('❌ 文本生成失败:', textError.message);
    }
    
  } catch (error) {
    console.log('❌ 测试失败:', error.message);
    console.log('错误类型:', error.constructor.name);
    
    if (error.message.includes('fetch failed')) {
      console.log('\n💡 可能的解决方案:');
      console.log('1. 检查网络连接');
      console.log('2. 确认API密钥是否有效');
      console.log('3. 检查防火墙设置');
      console.log('4. 尝试使用VPN');
    }
  }
}

// 运行测试
if (require.main === module) {
  testGeminiModels().catch(console.error);
}

module.exports = { testGeminiModels };