// 测试真实的Google Gemini图像生成功能
const fs = require('fs');
const path = require('path');

async function testRealGeminiGeneration() {
  try {
    console.log('=== 测试真实的Gemini图像生成 ===\n');

    // 1. 检查API密钥配置
    console.log('1. 检查API密钥配置...');
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const apiKey = envContent.match(/GOOGLE_AI_API_KEY="([^"]+)"/)?.[1];
    const demoMode = envContent.match(/NEXT_PUBLIC_DEMO_MODE="([^"]+)"/)?.[1];
    
    console.log(`API密钥: ${apiKey ? (apiKey.startsWith('AIza') ? '✅ 真实密钥' : '❌ 演示密钥') : '❌ 未配置'}`);
    console.log(`演示模式: ${demoMode === 'true' ? '❌ 启用' : '✅ 禁用'}\n`);

    if (!apiKey || !apiKey.startsWith('AIza')) {
      console.log('❌ 请先配置真实的Google AI API密钥');
      console.log('运行: node setup-real-gemini.js 获取设置指导');
      return;
    }

    // 2. 测试Gemini API连接
    console.log('2. 测试Gemini API连接...');
    try {
      const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      
      if (!modelsResponse.ok) {
        console.log('❌ API密钥验证失败');
        console.log(`状态码: ${modelsResponse.status}`);
        const errorText = await modelsResponse.text();
        console.log(`错误: ${errorText}`);
        return;
      }
      
      const modelsData = await modelsResponse.json();
      console.log('✅ API连接成功');
      console.log(`可用模型数量: ${modelsData.models?.length || 0}\n`);
      
    } catch (error) {
      console.log('❌ API连接失败:', error.message);
      return;
    }

    // 3. 创建测试图片
    console.log('3. 准备测试图片...');
    const testImagePath = path.join(__dirname, 'test-real-image.png');
    
    // 创建一个简单的PNG图片
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
    console.log('✅ 测试图片创建成功\n');

    // 4. 测试应用的图像生成API
    console.log('4. 测试应用的图像生成API...');
    
    const imageBuffer = fs.readFileSync(testImagePath);
    const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
    
    const formData = new FormData();
    formData.append('image', imageBlob, 'test-real-image.png');
    formData.append('location', JSON.stringify({
      lat: 31.2304,
      lng: 121.4737,
      address: '上海市黄浦区外滩',
      name: '上海外滩'
    }));

    const startTime = Date.now();
    const generateResponse = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      body: formData
    });
    const endTime = Date.now();

    console.log(`响应状态码: ${generateResponse.status}`);
    console.log(`响应时间: ${endTime - startTime}ms`);

    if (generateResponse.ok) {
      const result = await generateResponse.json();
      console.log('\n✅ 图像生成成功！');
      
      // 分析响应结果
      console.log('=== 生成结果分析 ===');
      console.log(`ID: ${result.id}`);
      console.log(`提示词: ${result.prompt}`);
      console.log(`位置: ${result.location?.name || '未知'}`);
      console.log(`剩余使用次数: ${result.remainingUsage}`);
      
      // 检查图像类型
      if (result.imageUrl) {
        if (result.imageUrl.startsWith('data:image/')) {
          console.log('📸 图像类型: Base64数据URL');
          console.log(`📏 数据长度: ${result.imageUrl.length} 字符`);
          
          // 检查是否是演示数据
          if (result.imageUrl.length < 200) {
            console.log('⚠️  警告: 图像数据过短，可能仍在演示模式');
          } else {
            console.log('✅ 图像数据长度正常，可能是真实生成');
          }
          
          // 分析Base64数据
          const base64Data = result.imageUrl.split(',')[1];
          if (base64Data) {
            const imageBuffer = Buffer.from(base64Data, 'base64');
            console.log(`🖼️  解码后图像大小: ${imageBuffer.length} 字节`);
            
            // 检查图像格式
            if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50) {
              console.log('📄 图像格式: PNG');
            } else if (imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8) {
              console.log('📄 图像格式: JPEG');
            } else {
              console.log('📄 图像格式: 未知');
            }
          }
          
        } else {
          console.log('🔗 图像类型: URL链接');
          console.log(`🌐 URL: ${result.imageUrl}`);
        }
      } else {
        console.log('❌ 未返回图像数据');
      }
      
      // 检查是否是演示模式的特征
      console.log('\n=== 真实性验证 ===');
      const isDemoLike = (
        result.id?.startsWith('demo-') ||
        result.prompt?.includes('演示模式') ||
        result.remainingUsage === 999 ||
        (result.imageUrl && result.imageUrl.length < 200)
      );
      
      if (isDemoLike) {
        console.log('❌ 检测到演示模式特征:');
        if (result.id?.startsWith('demo-')) console.log('   - ID以"demo-"开头');
        if (result.prompt?.includes('演示模式')) console.log('   - 提示词包含"演示模式"');
        if (result.remainingUsage === 999) console.log('   - 剩余次数为999（演示值）');
        if (result.imageUrl && result.imageUrl.length < 200) console.log('   - 图像数据过短');
        console.log('\n🔧 建议检查:');
        console.log('   1. 确认API密钥配置正确');
        console.log('   2. 确认演示模式已禁用');
        console.log('   3. 重启开发服务器');
      } else {
        console.log('✅ 看起来是真实的Gemini生成结果');
        console.log('   - ID格式正常');
        console.log('   - 提示词不包含演示标识');
        console.log('   - 剩余次数合理');
        console.log('   - 图像数据充足');
      }
      
    } else {
      const errorResult = await generateResponse.json();
      console.log('❌ 图像生成失败');
      console.log('错误响应:', errorResult);
    }

    // 5. 清理测试文件
    console.log('\n5. 清理测试文件...');
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('✅ 测试图片已清理');
    }

    console.log('\n=== 测试完成 ===');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    
    // 清理测试文件
    const testImagePath = path.join(__dirname, 'test-real-image.png');
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  }
}

testRealGeminiGeneration();