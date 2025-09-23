const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const path = require('path');

async function testImageGeneration() {
  try {
    console.log('=== Testing Image Generation API ===');
    
    // 创建一个测试图片文件（1x1像素的PNG）
    const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
    const testImagePath = path.join(__dirname, 'test-image.png');
    fs.writeFileSync(testImagePath, testImageData);
    
    console.log('1. Created test image file');
    
    // 准备测试数据
    const testLocation = {
      lat: 39.9042,
      lng: 116.4074,
      address: "北京市天安门广场",
      name: "天安门广场"
    };
    
    // 创建FormData
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    
    // 添加图片文件
    formData.append('image', fs.createReadStream(testImagePath), {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    
    // 添加位置信息
    formData.append('location', JSON.stringify(testLocation));
    
    console.log('2. Prepared form data with image and location');
    
    // 发送请求到图像生成API
    console.log('3. Sending request to /api/generate...');
    const response = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Image generation successful!');
      console.log('Result:', {
        id: result.id,
        imageUrl: result.imageUrl ? result.imageUrl.substring(0, 100) + '...' : 'No URL',
        prompt: result.prompt,
        location: result.location,
        remainingUsage: result.remainingUsage
      });
      
      // 检查返回的图片URL类型
      if (result.imageUrl) {
        if (result.imageUrl.startsWith('data:image/')) {
          console.log('📸 Generated image is base64 data URL (Gemini API)');
        } else if (result.imageUrl.includes('unsplash.com')) {
          console.log('📸 Generated image is Unsplash demo image');
        } else if (result.imageUrl.includes('picsum.photos')) {
          console.log('📸 Generated image is Picsum fallback image');
        } else {
          console.log('📸 Generated image URL type:', result.imageUrl.substring(0, 50));
        }
      }
      
    } else {
      const errorText = await response.text();
      console.log('❌ Image generation failed');
      console.log('Error response:', errorText);
      
      // 尝试解析JSON错误
      try {
        const errorJson = JSON.parse(errorText);
        console.log('Error details:', errorJson);
      } catch (e) {
        console.log('Raw error text:', errorText);
      }
    }
    
    // 清理测试文件
    fs.unlinkSync(testImagePath);
    console.log('4. Cleaned up test image file');
    
  } catch (error) {
    console.error('❌ Error testing image generation:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testImageGeneration();