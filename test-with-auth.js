// 带认证的API测试脚本
const fs = require('fs');
const path = require('path');

// 创建测试图片
function createTestImage() {
  const testImagePath = path.join(__dirname, 'test-image.png');
  
  // 创建一个简单的PNG图片数据 (1x1像素的透明PNG)
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, 0x06, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
    0x1F, 0x15, 0xC4, 0x89, // CRC
    0x00, 0x00, 0x00, 0x0A, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x78, 0x9C, 0x62, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // compressed data
    0xE2, 0x21, 0xBC, 0x33, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  fs.writeFileSync(testImagePath, pngData);
  return testImagePath;
}

// 获取认证Cookie
async function getAuthCookie() {
  try {
    console.log('🔐 尝试获取认证信息...');
    
    // 首先访问登录页面获取CSRF token
    const loginPageResponse = await fetch('http://localhost:3000/api/auth/signin');
    const cookies = loginPageResponse.headers.get('set-cookie') || '';
    
    console.log('✅ 获取到初始cookies');
    return cookies;
  } catch (error) {
    console.log('❌ 获取认证信息失败:', error.message);
    return null;
  }
}

// 测试应用API（带认证）
async function testAppAPIWithAuth() {
  console.log('🧪 测试应用API端点的真实Gemini功能（带认证）\n');
  
  try {
    // 1. 创建测试图片
    console.log('1. 创建测试图片...');
    const imagePath = createTestImage();
    console.log('✅ 测试图片已创建');
    
    // 2. 获取认证信息
    console.log('\n2. 获取认证信息...');
    const authCookie = await getAuthCookie();
    
    // 3. 准备FormData
    console.log('\n3. 准备请求数据...');
    const imageBuffer = fs.readFileSync(imagePath);
    
    const formData = new FormData();
    formData.append('image', new Blob([imageBuffer], { type: 'image/png' }), 'test.png');
    formData.append('location', '北京市天安门广场');
    
    console.log('✅ FormData已准备');
    
    // 4. 发送请求到应用API
    console.log('\n4. 发送请求到 /api/generate...');
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    };
    
    if (authCookie) {
      headers['Cookie'] = authCookie;
    }
    
    const response = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      body: formData,
      headers
    });
    
    console.log(`状态码: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 请求成功！');
      
      // 5. 分析响应
      console.log('\n📊 响应分析:');
      console.log(`ID格式: ${result.id} (${result.id?.length || 0}字符)`);
      console.log(`提示词: ${result.prompt?.substring(0, 100)}...`);
      console.log(`位置: ${result.location}`);
      console.log(`剩余次数: ${result.remainingUsage}`);
      console.log(`图像数据长度: ${result.imageUrl?.length || 0}字符`);
      
      // 6. 判断是否为真实生成
      console.log('\n🔍 真实性判断:');
      
      const isRealGeneration = 
        result.id?.length > 10 && // 真实ID通常较长
        result.remainingUsage !== 999 && // 演示模式固定为999
        result.imageUrl?.length > 10000 && // 真实图像数据较大
        !result.prompt?.includes('这是一个演示'); // 不包含演示标识
      
      if (isRealGeneration) {
        console.log('🎉 判断结果: 真实的Gemini生成！');
        console.log('✅ ID格式正确');
        console.log('✅ 剩余次数不是演示值');
        console.log('✅ 图像数据大小合理');
        console.log('✅ 提示词不包含演示标识');
        
        // 保存图像数据用于验证
        if (result.imageUrl && result.imageUrl.startsWith('data:image/')) {
          const base64Data = result.imageUrl.split(',')[1];
          const imageBuffer = Buffer.from(base64Data, 'base64');
          const outputPath = path.join(__dirname, 'generated-image.png');
          fs.writeFileSync(outputPath, imageBuffer);
          console.log(`💾 生成的图像已保存到: ${outputPath}`);
        }
      } else {
        console.log('⚠️  判断结果: 可能仍在演示模式或生成失败');
        
        if (result.remainingUsage === 999) {
          console.log('❌ 剩余次数为999（演示模式特征）');
        }
        if (result.imageUrl?.length < 10000) {
          console.log('❌ 图像数据过小（可能是演示数据）');
        }
        if (result.prompt?.includes('这是一个演示')) {
          console.log('❌ 提示词包含演示标识');
        }
      }
      
      // 7. 保存结果用于验证
      const resultPath = path.join(__dirname, 'real-api-test-result.json');
      fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
      console.log(`\n💾 完整结果已保存到: ${resultPath}`);
      
    } else {
      console.log('❌ 请求失败');
      const errorText = await response.text();
      console.log('错误信息:', errorText);
      
      if (response.status === 401) {
        console.log('\n💡 建议:');
        console.log('1. 在浏览器中访问 http://localhost:3000 并登录');
        console.log('2. 或者临时启用演示模式进行测试');
        console.log('3. 或者通过前端界面直接测试');
      }
    }
    
    // 8. 清理测试文件
    console.log('\n🧹 清理测试文件...');
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log('✅ 测试图片已删除');
    }
    
  } catch (error) {
    console.log('❌ 测试过程中出现错误:', error.message);
  }
}

// 运行测试
if (require.main === module) {
  testAppAPIWithAuth().catch(console.error);
}

module.exports = { testAppAPIWithAuth };