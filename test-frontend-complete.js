// 测试完整的前端图像生成流程
const fs = require('fs');
const path = require('path');

async function testFrontendImageGeneration() {
  try {
    console.log('=== 测试前端图像生成完整流程 ===\n');

    // 1. 访问创建页面
    console.log('1. 访问创建页面...');
    const createPageResponse = await fetch('http://localhost:3000/create');
    console.log(`创建页面状态码: ${createPageResponse.status}`);
    
    if (createPageResponse.status !== 200) {
      console.log('❌ 创建页面访问失败');
      return;
    }
    console.log('✅ 创建页面访问成功\n');

    // 2. 创建一个简单的1x1像素PNG图片
    console.log('2. 准备测试图片...');
    const testImagePath = path.join(__dirname, 'test-image.png');
    
    // 创建一个最小的PNG图片 (1x1像素，白色)
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
      0x49, 0x48, 0x44, 0x52, // IHDR
      0x00, 0x00, 0x00, 0x01, // width: 1
      0x00, 0x00, 0x00, 0x01, // height: 1
      0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
      0x90, 0x77, 0x53, 0xDE, // CRC
      0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
      0x49, 0x44, 0x41, 0x54, // IDAT
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // compressed data
      0xE2, 0x21, 0xBC, 0x33, // CRC
      0x00, 0x00, 0x00, 0x00, // IEND chunk length
      0x49, 0x45, 0x4E, 0x44, // IEND
      0xAE, 0x42, 0x60, 0x82  // CRC
    ]);
    
    fs.writeFileSync(testImagePath, pngData);
    console.log('✅ 测试图片创建成功\n');

    // 3. 使用标准的FormData API
    console.log('3. 准备图像生成请求...');
    
    // 读取图片文件
    const imageBuffer = fs.readFileSync(testImagePath);
    const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
    
    // 创建FormData
    const formData = new FormData();
    formData.append('image', imageBlob, 'test-image.png');
    formData.append('location', JSON.stringify({
      lat: 39.9042,
      lng: 116.4074,
      address: '北京市天安门广场',
      name: '天安门广场'
    }));

    // 4. 发送图像生成请求
    console.log('4. 发送图像生成请求...');
    const generateResponse = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      body: formData
    });

    console.log(`响应状态码: ${generateResponse.status}`);

    if (generateResponse.ok) {
      const result = await generateResponse.json();
      console.log('✅ 图像生成成功！');
      console.log('生成结果:', {
        id: result.id,
        prompt: result.prompt,
        location: result.location,
        remainingUsage: result.remainingUsage,
        imageUrlType: result.imageUrl ? (result.imageUrl.startsWith('data:') ? 'Base64 数据URL' : 'URL链接') : '无',
        imageUrlLength: result.imageUrl ? result.imageUrl.length : 0
      });
      
      // 检查图像数据
      if (result.imageUrl && result.imageUrl.startsWith('data:image/')) {
        console.log('📸 生成的图像是 Base64 数据URL (演示模式)');
      } else if (result.imageUrl) {
        console.log('🔗 生成的图像是 URL 链接 (生产模式)');
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

    console.log('\n=== 前端图像生成测试完成 ===');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    
    // 清理测试文件
    const testImagePath = path.join(__dirname, 'test-image.png');
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  }
}

testFrontendImageGeneration();