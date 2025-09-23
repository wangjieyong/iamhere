// 交互式API密钥配置脚本
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 验证API密钥格式
function validateApiKey(apiKey) {
  if (!apiKey) {
    return { valid: false, error: 'API密钥不能为空' };
  }
  
  if (!apiKey.startsWith('AIza')) {
    return { valid: false, error: 'API密钥应该以"AIza"开头' };
  }
  
  if (apiKey.length !== 39) {
    return { valid: false, error: `API密钥长度应该是39个字符，当前长度：${apiKey.length}` };
  }
  
  return { valid: true };
}

// 测试API密钥有效性
async function testApiKey(apiKey) {
  try {
    console.log('🔍 正在验证API密钥...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API密钥验证成功！');
      console.log(`📊 可用模型数量: ${data.models?.length || 0}`);
      
      // 查找图像生成相关模型
      const imageModels = data.models?.filter(model => 
        model.name.includes('gemini') && 
        model.supportedGenerationMethods?.includes('generateContent')
      ) || [];
      
      console.log(`🖼️  支持内容生成的Gemini模型: ${imageModels.length}`);
      
      return true;
    } else {
      console.log('❌ API密钥验证失败');
      console.log(`状态码: ${response.status}`);
      
      if (response.status === 400) {
        console.log('可能的原因: API密钥格式错误');
      } else if (response.status === 403) {
        console.log('可能的原因: API密钥无效或权限不足');
      } else if (response.status === 429) {
        console.log('可能的原因: API调用频率限制');
      }
      
      return false;
    }
  } catch (error) {
    console.log('❌ 网络错误:', error.message);
    return false;
  }
}

// 更新环境配置文件
function updateEnvFile(apiKey) {
  try {
    const envPath = path.join(__dirname, '.env.local');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // 更新API密钥
    envContent = envContent.replace(
      /GOOGLE_AI_API_KEY="[^"]+"/,
      `GOOGLE_AI_API_KEY="${apiKey}"`
    );
    
    // 禁用演示模式
    envContent = envContent.replace(
      /NEXT_PUBLIC_DEMO_MODE="true"/,
      'NEXT_PUBLIC_DEMO_MODE="false"'
    );
    
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ 环境配置文件已更新');
    console.log('✅ 演示模式已禁用');
    
    return true;
  } catch (error) {
    console.log('❌ 更新配置文件失败:', error.message);
    return false;
  }
}

// 主配置流程
async function configureApiKey() {
  console.log('🔧 Google AI API密钥配置向导\n');
  
  console.log('📝 请按照以下步骤获取API密钥:');
  console.log('   1. 访问: https://aistudio.google.com/');
  console.log('   2. 登录你的Google账户');
  console.log('   3. 点击 "Get API key" 按钮');
  console.log('   4. 创建新的API密钥或使用现有的');
  console.log('   5. 复制API密钥\n');
  
  // 询问用户是否已获取API密钥
  const hasApiKey = await new Promise((resolve) => {
    rl.question('你是否已经获取了API密钥？(y/n): ', (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
  
  if (!hasApiKey) {
    console.log('\n请先获取API密钥，然后重新运行此脚本。');
    rl.close();
    return;
  }
  
  // 获取API密钥输入
  const apiKey = await new Promise((resolve) => {
    rl.question('\n请输入你的Google AI API密钥: ', (answer) => {
      resolve(answer.trim());
    });
  });
  
  // 验证API密钥格式
  const validation = validateApiKey(apiKey);
  if (!validation.valid) {
    console.log(`❌ ${validation.error}`);
    rl.close();
    return;
  }
  
  console.log('✅ API密钥格式正确');
  
  // 测试API密钥
  const isValid = await testApiKey(apiKey);
  if (!isValid) {
    console.log('\n❌ API密钥验证失败，请检查密钥是否正确');
    rl.close();
    return;
  }
  
  // 更新配置文件
  const updated = updateEnvFile(apiKey);
  if (!updated) {
    rl.close();
    return;
  }
  
  console.log('\n🎉 配置完成！');
  console.log('\n📋 下一步操作:');
  console.log('   1. 重启开发服务器 (Ctrl+C 然后 npm run dev)');
  console.log('   2. 运行测试: node test-real-gemini.js');
  console.log('   3. 在浏览器中测试图像生成功能');
  
  rl.close();
}

// 如果直接运行此脚本
if (require.main === module) {
  configureApiKey().catch(console.error);
}

module.exports = { validateApiKey, testApiKey, updateEnvFile };