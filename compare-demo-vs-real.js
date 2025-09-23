// 对比演示模式和真实模式的输出差异
const fs = require('fs');
const path = require('path');

async function compareDemoVsReal() {
  console.log('=== 演示模式 vs 真实模式对比 ===\n');

  // 1. 当前配置状态
  console.log('📋 当前配置状态:');
  const envPath = path.join(__dirname, '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const apiKey = envContent.match(/GOOGLE_AI_API_KEY="([^"]+)"/)?.[1];
  const demoMode = envContent.match(/NEXT_PUBLIC_DEMO_MODE="([^"]+)"/)?.[1];
  
  console.log(`   API密钥: ${apiKey}`);
  console.log(`   演示模式: ${demoMode}\n`);

  // 2. 演示模式特征
  console.log('🎭 演示模式特征:');
  console.log('   ✓ ID格式: demo-{timestamp}');
  console.log('   ✓ 提示词: 包含"演示模式"字样');
  console.log('   ✓ 剩余次数: 999（无限制）');
  console.log('   ✓ 图像数据: 极短的Base64字符串（约118字符）');
  console.log('   ✓ 响应时间: 很快（<500ms）');
  console.log('   ✓ 图像内容: 固定的演示图片\n');

  // 3. 真实模式特征
  console.log('🚀 真实模式特征:');
  console.log('   ✓ ID格式: 随机UUID或时间戳');
  console.log('   ✓ 提示词: 基于实际位置和图片内容生成');
  console.log('   ✓ 剩余次数: 实际的使用限制（如每日3次）');
  console.log('   ✓ 图像数据: 完整的Base64字符串（通常>10000字符）');
  console.log('   ✓ 响应时间: 较慢（通常2-10秒）');
  console.log('   ✓ 图像内容: 由Gemini AI实际生成的独特图片\n');

  // 4. 如何验证真实性
  console.log('🔍 如何验证生成结果的真实性:');
  console.log('   1. 检查响应ID是否以"demo-"开头');
  console.log('   2. 检查提示词是否包含"演示模式"');
  console.log('   3. 检查剩余使用次数是否为999');
  console.log('   4. 检查图像Base64数据长度');
  console.log('   5. 检查响应时间是否合理');
  console.log('   6. 解码Base64并检查图像尺寸和内容\n');

  // 5. 测试当前模式
  console.log('🧪 测试当前模式...');
  
  try {
    // 创建测试图片
    const testImagePath = path.join(__dirname, 'test-compare.png');
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE,
      0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54,
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
      0xE2, 0x21, 0xBC, 0x33, 0x00, 0x00, 0x00, 0x00,
      0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    fs.writeFileSync(testImagePath, pngData);

    // 发送请求
    const imageBuffer = fs.readFileSync(testImagePath);
    const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
    
    const formData = new FormData();
    formData.append('image', imageBlob, 'test-compare.png');
    formData.append('location', JSON.stringify({
      lat: 39.9042,
      lng: 116.4074,
      address: '北京市天安门广场',
      name: '天安门广场'
    }));

    const startTime = Date.now();
    const response = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      body: formData
    });
    const endTime = Date.now();

    if (response.ok) {
      const result = await response.json();
      
      console.log('📊 当前测试结果:');
      console.log(`   ID: ${result.id}`);
      console.log(`   ID类型: ${result.id?.startsWith('demo-') ? '演示模式' : '真实模式'}`);
      console.log(`   提示词: ${result.prompt}`);
      console.log(`   包含演示标识: ${result.prompt?.includes('演示模式') ? '是' : '否'}`);
      console.log(`   剩余次数: ${result.remainingUsage}`);
      console.log(`   次数类型: ${result.remainingUsage === 999 ? '演示模式' : '真实模式'}`);
      console.log(`   响应时间: ${endTime - startTime}ms`);
      console.log(`   图像数据长度: ${result.imageUrl?.length || 0} 字符`);
      console.log(`   数据长度类型: ${(result.imageUrl?.length || 0) < 1000 ? '演示模式' : '真实模式'}`);
      
      // 综合判断
      const isDemo = (
        result.id?.startsWith('demo-') ||
        result.prompt?.includes('演示模式') ||
        result.remainingUsage === 999 ||
        (result.imageUrl?.length || 0) < 1000
      );
      
      console.log(`\n🎯 综合判断: ${isDemo ? '演示模式' : '真实模式'}`);
      
      if (isDemo) {
        console.log('\n💡 要切换到真实模式:');
        console.log('   1. 获取真实的Google AI API密钥');
        console.log('   2. 运行: node setup-real-gemini.js YOUR_API_KEY');
        console.log('   3. 重启开发服务器');
        console.log('   4. 重新测试');
      }
      
    } else {
      console.log('❌ 测试请求失败');
    }

    // 清理
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }

  } catch (error) {
    console.log('❌ 测试失败:', error.message);
  }

  console.log('\n=== 对比完成 ===');
}

compareDemoVsReal();