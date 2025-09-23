// 模拟真实的Gemini API响应来测试应用功能
const fs = require('fs');
const path = require('path');

async function testSimulatedGemini() {
  console.log('🎭 测试模拟的真实Gemini响应\n');
  
  // 创建一个简单的测试图片（1x1像素的PNG）
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  const testImagePath = path.join(__dirname, 'test-image-simulated.png');
  
  try {
    // 创建测试图片文件
    const imageBuffer = Buffer.from(testImageBase64, 'base64');
    fs.writeFileSync(testImagePath, imageBuffer);
    console.log('✅ 创建测试图片:', testImagePath);
    
    // 准备模拟的真实Gemini响应数据
    const simulatedGeminiResponse = {
      id: `gemini-real-${Date.now()}`,
      imageUrl: null, // 真实Gemini不返回URL，而是返回base64数据
      imageData: generateRealisticImageData(), // 模拟真实的图像数据
      prompt: "基于北京市天安门广场的旅行摄影风格图像，展现了现代都市与历史建筑的完美融合。图像采用专业摄影技术，色彩饱满，构图精美。",
      location: {
        lat: 39.9042,
        lng: 116.4074,
        address: "北京市天安门广场",
        name: "天安门广场"
      },
      remainingUsage: 98, // 真实使用会减少
      metadata: {
        model: "gemini-2.5-flash-image-preview",
        generatedAt: new Date().toISOString(),
        processingTime: "12.3s",
        imageSize: "1024x1024",
        format: "PNG"
      }
    };
    
    // 准备FormData
    const FormData = require('form-data');
    const form = new FormData();
    
    // 添加图片文件
    form.append('image', fs.createReadStream(testImagePath));
    
    // 添加其他字段
    form.append('prompt', '在天安门广场拍摄一张旅行摄影风格的照片');
    form.append('location', JSON.stringify({
      lat: 39.9042,
      lng: 116.4074,
      address: "北京市天安门广场",
      name: "天安门广场"
    }));
    form.append('style', 'photorealistic, travel photography, high quality');
    
    console.log('📤 发送模拟请求到 /api/generate...');
    
    // 发送请求到API
    const response = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });
    
    console.log('📥 收到响应，状态码:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ API调用成功！');
      
      // 分析响应数据
      console.log('\n📊 响应数据分析:');
      console.log('- ID格式:', result.id);
      console.log('- 提示词长度:', result.prompt?.length || 0, '字符');
      console.log('- 剩余次数:', result.remainingUsage);
      console.log('- 图像URL:', result.imageUrl ? '有' : '无');
      console.log('- 位置信息:', result.location ? '有' : '无');
      
      // 判断是否为真实Gemini响应的特征
      console.log('\n🔍 真实性分析:');
      
      const isRealGemini = analyzeGeminiResponse(result);
      
      if (isRealGemini.isReal) {
        console.log('🎉 检测到真实的Gemini生成！');
        console.log('✅ 特征匹配:', isRealGemini.features.join(', '));
      } else {
        console.log('⚠️  检测到演示模式或模拟响应');
        console.log('❌ 缺少特征:', isRealGemini.missingFeatures.join(', '));
      }
      
      // 保存完整结果
      const resultPath = path.join(__dirname, 'simulated-gemini-result.json');
      fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
      console.log('\n💾 完整结果已保存到:', resultPath);
      
      // 如果有图像数据，尝试保存
      if (result.imageUrl && result.imageUrl.startsWith('data:image/')) {
        try {
          const base64Data = result.imageUrl.split(',')[1];
          const imageBuffer = Buffer.from(base64Data, 'base64');
          const imagePath = path.join(__dirname, 'generated-image-simulated.png');
          fs.writeFileSync(imagePath, imageBuffer);
          console.log('🖼️  生成的图像已保存到:', imagePath);
        } catch (imageError) {
          console.log('❌ 保存图像失败:', imageError.message);
        }
      }
      
    } else {
      const errorText = await response.text();
      console.log('❌ API调用失败:', response.status, response.statusText);
      console.log('错误详情:', errorText);
    }
    
  } catch (error) {
    console.log('❌ 测试失败:', error.message);
    console.log('错误类型:', error.constructor.name);
  } finally {
    // 清理测试文件
    try {
      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
        console.log('🧹 清理测试文件:', testImagePath);
      }
    } catch (cleanupError) {
      console.log('⚠️  清理文件失败:', cleanupError.message);
    }
  }
}

// 生成模拟的真实图像数据
function generateRealisticImageData() {
  // 模拟一个更大的base64图像数据（真实的Gemini生成的图像通常很大）
  const baseData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  
  // 重复数据来模拟更大的图像
  let largeData = '';
  for (let i = 0; i < 100; i++) {
    largeData += baseData;
  }
  
  return `data:image/png;base64,${largeData}`;
}

// 分析响应是否为真实的Gemini生成
function analyzeGeminiResponse(result) {
  const features = [];
  const missingFeatures = [];
  
  // 检查ID格式（真实Gemini通常有特定的ID格式）
  if (result.id && !result.id.startsWith('demo-')) {
    features.push('非演示ID格式');
  } else {
    missingFeatures.push('真实ID格式');
  }
  
  // 检查剩余次数（真实使用会减少）
  if (result.remainingUsage && result.remainingUsage < 999) {
    features.push('真实使用计数');
  } else {
    missingFeatures.push('真实使用计数');
  }
  
  // 检查提示词（真实Gemini会有更详细的提示词）
  if (result.prompt && result.prompt.length > 50 && !result.prompt.includes('备用图片')) {
    features.push('详细提示词');
  } else {
    missingFeatures.push('详细提示词');
  }
  
  // 检查图像数据大小（真实生成的图像通常较大）
  if (result.imageUrl && result.imageUrl.length > 1000) {
    features.push('大图像数据');
  } else {
    missingFeatures.push('大图像数据');
  }
  
  // 检查是否有元数据
  if (result.metadata) {
    features.push('包含元数据');
  } else {
    missingFeatures.push('包含元数据');
  }
  
  return {
    isReal: features.length >= 3, // 至少3个特征匹配才认为是真实的
    features,
    missingFeatures,
    score: features.length / (features.length + missingFeatures.length)
  };
}

// 运行测试
if (require.main === module) {
  testSimulatedGemini().catch(console.error);
}

module.exports = { testSimulatedGemini, analyzeGeminiResponse };