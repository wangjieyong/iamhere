import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API 配置
const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const MODEL_NAME = 'gemini-2.5-flash-image-preview';

// 初始化 Gemini 客户端
let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!GEMINI_API_KEY) {
    throw new Error('GOOGLE_AI_API_KEY environment variable is not set');
  }
  
  if (!genAI) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  
  return genAI;
}

// 图像生成接口
export interface ImageGenerationRequest {
  prompt: string;
  location?: string;
  style?: string;
}

export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  imageData?: string; // base64 encoded image data
  error?: string;
  metadata?: {
    prompt: string;
    model: string;
    generatedAt: string;
  };
}

// 重试配置
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1秒
  maxDelay: 10000, // 10秒
};

// 延迟函数
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 计算重试延迟（指数退避）
function calculateRetryDelay(attempt: number): number {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
}

// 构建优化的提示词
function buildOptimizedPrompt(request: ImageGenerationRequest): string {
  let prompt = request.prompt;
  
  // 如果包含地点信息，增强提示词
  if (request.location) {
    prompt = `Create a beautiful, photorealistic image of ${prompt} at ${request.location}. `;
  }
  
  // 如果指定了风格，添加风格描述
  if (request.style) {
    prompt += ` Style: ${request.style}.`;
  }
  
  // 添加质量和细节要求
  prompt += ' High quality, detailed, professional photography, vibrant colors, excellent composition.';
  
  return prompt;
}

// 主要的图像生成函数
export async function generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const client = getGeminiClient();
      const model = client.getGenerativeModel({ model: MODEL_NAME });
      
      const optimizedPrompt = buildOptimizedPrompt(request);
      
      console.log(`[Gemini] Generating image (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1}):`, {
        prompt: optimizedPrompt,
        location: request.location,
        style: request.style,
      });
      
      const result = await model.generateContent(optimizedPrompt);
      const response = await result.response;
      
      // 检查响应是否包含图像数据
      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error('No candidates returned from Gemini API');
      }
      
      const candidate = candidates[0];
      if (!candidate.content || !candidate.content.parts) {
        throw new Error('No content parts in response');
      }
      
      // 查找图像数据
      let imageData: string | null = null;
      let textResponse: string | null = null;
      
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          imageData = part.inlineData.data;
        }
        if (part.text) {
          textResponse = part.text;
        }
      }
      
      if (!imageData) {
        throw new Error('No image data found in response');
      }
      
      console.log(`[Gemini] Image generated successfully on attempt ${attempt + 1}`);
      
      return {
        success: true,
        imageData,
        metadata: {
          prompt: optimizedPrompt,
          model: MODEL_NAME,
          generatedAt: new Date().toISOString(),
        },
      };
      
    } catch (error) {
      lastError = error as Error;
      console.error(`[Gemini] Attempt ${attempt + 1} failed:`, error);
      
      // 如果是最后一次尝试，不再重试
      if (attempt === RETRY_CONFIG.maxRetries) {
        break;
      }
      
      // 计算延迟时间并等待
      const retryDelay = calculateRetryDelay(attempt);
      console.log(`[Gemini] Retrying in ${retryDelay}ms...`);
      await delay(retryDelay);
    }
  }
  
  // 所有重试都失败了
  const errorMessage = lastError?.message || 'Unknown error occurred';
  console.error('[Gemini] All retry attempts failed:', errorMessage);
  
  return {
    success: false,
    error: `Failed to generate image after ${RETRY_CONFIG.maxRetries + 1} attempts: ${errorMessage}`,
  };
}

// 检查 Gemini API 是否可用
export async function checkGeminiAvailability(): Promise<boolean> {
  try {
    if (!GEMINI_API_KEY) {
      console.warn('[Gemini] API key not configured');
      return false;
    }
    
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: MODEL_NAME });
    
    // 尝试生成一个简单的测试图像
    const testPrompt = 'A simple red circle on white background';
    const result = await model.generateContent(testPrompt);
    const response = await result.response;
    
    return !!(response.candidates && response.candidates.length > 0);
  } catch (error) {
    console.error('[Gemini] Availability check failed:', error);
    return false;
  }
}

// 获取模型信息
export function getModelInfo() {
  return {
    name: MODEL_NAME,
    provider: 'Google Gemini',
    version: '2.5 Flash Image Preview',
    capabilities: [
      'Text-to-Image Generation',
      'Image Editing',
      'Multi-image Fusion',
      'Character Consistency',
      'Natural Language Editing',
    ],
    pricing: {
      perImage: 0.039, // USD
      perMillionTokens: 30.0, // USD
      tokensPerImage: 1290,
    },
  };
}

// 演示模式的图像生成（用于替换当前的模拟实现）
export async function generateDemoImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
  // 检查是否有有效的API密钥
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your-google-ai-api-key" || GEMINI_API_KEY.length < 10) {
    console.log('[Gemini] Demo mode: No valid API key, returning mock image data');
    
    // 返回一个简单的模拟图像（1x1像素的透明PNG）
    const mockImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    return {
      success: true,
      imageData: mockImageData,
      metadata: {
        prompt: `Demo: ${request.prompt}`,
        model: 'demo-mode',
        generatedAt: new Date().toISOString(),
      },
    };
  }
  
  // 如果有有效的API密钥，使用真实的 Gemini API
  console.log('[Gemini] Demo mode: Using real API with demo prompt');
  const demoRequest: ImageGenerationRequest = {
    ...request,
    prompt: `Demo: ${request.prompt}. Create a stunning, high-quality demonstration image.`,
    style: request.style || 'photorealistic, professional, vibrant',
  };
  
  return generateImage(demoRequest);
}