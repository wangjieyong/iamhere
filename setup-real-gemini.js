// 设置和验证真实的Google Gemini API
const fs = require('fs');
const path = require('path');

async function setupRealGeminiAPI() {
  console.log('=== Google Gemini API 设置向导 ===\n');

  // 1. 检查当前配置
  console.log('1. 检查当前配置...');
  const envPath = path.join(__dirname, '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const currentApiKey = envContent.match(/GOOGLE_AI_API_KEY="([^"]+)"/)?.[1];
  console.log(`当前API密钥: ${currentApiKey}`);
  
  if (currentApiKey === 'your-google-ai-api-key') {
    console.log('❌ 当前使用的是演示模式的占位符密钥\n');
  } else {
    console.log('✅ 已配置API密钥\n');
  }

  // 2. 提供获取API密钥的指导
  console.log('2. 获取Google AI API密钥的步骤:');
  console.log('   📝 访问: https://aistudio.google.com/');
  console.log('   🔑 点击 "Get API key" 按钮');
  console.log('   ➕ 创建新的API密钥或使用现有的');
  console.log('   📋 复制API密钥\n');

  // 3. 测试API密钥格式
  console.log('3. API密钥格式验证:');
  console.log('   ✅ 正确格式: AIza... (以AIza开头，39个字符)');
  console.log('   ❌ 错误格式: your-google-ai-api-key (占位符)\n');

  // 4. 提供配置示例
  console.log('4. 配置示例:');
  console.log('   将 .env.local 文件中的:');
  console.log('   GOOGLE_AI_API_KEY="your-google-ai-api-key"');
  console.log('   替换为:');
  console.log('   GOOGLE_AI_API_KEY="AIza...你的真实密钥"\n');

  // 5. 创建测试函数
  console.log('5. 测试API密钥有效性...');
  
  if (currentApiKey && currentApiKey !== 'your-google-ai-api-key') {
    try {
      console.log('正在测试API密钥...');
      
      // 测试Gemini API连接
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + currentApiKey);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API密钥有效！');
        console.log(`📊 可用模型数量: ${data.models?.length || 0}`);
        
        // 查找图像生成模型
        const imageModels = data.models?.filter(model => 
          model.name.includes('gemini') && 
          model.supportedGenerationMethods?.includes('generateContent')
        ) || [];
        
        console.log(`🖼️  支持图像生成的模型: ${imageModels.length}`);
        imageModels.forEach(model => {
          console.log(`   - ${model.displayName || model.name}`);
        });
        
      } else {
        console.log('❌ API密钥无效或有问题');
        console.log(`状态码: ${response.status}`);
        const errorText = await response.text();
        console.log(`错误信息: ${errorText}`);
      }
      
    } catch (error) {
      console.log('❌ 测试API密钥时发生错误:', error.message);
    }
  } else {
    console.log('⚠️  请先配置真实的API密钥');
  }

  console.log('\n=== 下一步操作 ===');
  console.log('1. 如果还没有API密钥，请访问 https://aistudio.google.com/ 获取');
  console.log('2. 将真实的API密钥配置到 .env.local 文件中');
  console.log('3. 运行 node test-real-gemini.js 测试真实的图像生成');
  console.log('4. 重启开发服务器以加载新的配置');
}

// 创建配置API密钥的辅助函数
function updateApiKey(newApiKey) {
  const envPath = path.join(__dirname, '.env.local');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // 验证API密钥格式
  if (!newApiKey.startsWith('AIza') || newApiKey.length !== 39) {
    console.log('❌ API密钥格式不正确');
    console.log('正确格式应该以 "AIza" 开头，总长度39个字符');
    return false;
  }
  
  // 更新API密钥
  envContent = envContent.replace(
    /GOOGLE_AI_API_KEY="[^"]+"/,
    `GOOGLE_AI_API_KEY="${newApiKey}"`
  );
  
  // 禁用演示模式
  envContent = envContent.replace(
    /NEXT_PUBLIC_DEMO_MODE="true"/,
    'NEXT_PUBLIC_DEMO_MODE="false"'
  );
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ API密钥已更新');
  console.log('✅ 演示模式已禁用');
  return true;
}

// 如果提供了命令行参数，直接更新API密钥
const apiKeyArg = process.argv[2];
if (apiKeyArg) {
  console.log('正在更新API密钥...');
  if (updateApiKey(apiKeyArg)) {
    console.log('请重启开发服务器以加载新配置');
  }
} else {
  setupRealGeminiAPI();
}

module.exports = { updateApiKey };