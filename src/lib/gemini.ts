import { GoogleGenerativeAI } from '@google/generative-ai';
import { API_CONFIG } from './constants';

// Gemini API 配置
const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const MODEL_NAME = 'gemini-2.5-flash-image-preview';

// 在开发环境中设置代理
if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
  // 只在服务器端（Node.js）环境中设置代理
  const proxyUrl = process.env.https_proxy || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.HTTP_PROXY || 'http://127.0.0.1:1087';
  
  try {
    const { HttpsProxyAgent } = require('https-proxy-agent');
    const originalFetch = global.fetch;
    
    // 重写全局 fetch 以使用代理
    global.fetch = async (url: string | URL | Request, options: any = {}) => {
      if (typeof url === 'string' && url.includes('generativelanguage.googleapis.com')) {
        const { default: fetch } = await import('node-fetch');
        const agent = new HttpsProxyAgent(proxyUrl);
        return fetch(url, { ...options, agent }) as any;
      }
      return originalFetch(url, options);
    };
    
    console.log(`[Gemini] Development proxy configured: ${proxyUrl}`);
  } catch (error) {
    console.warn('[Gemini] Failed to configure proxy:', error);
  }
}

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
  inputImage?: string; // base64 encoded input image
  inputImageMimeType?: string; // MIME type of input image
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

// 使用统一的重试配置
const RETRY_CONFIG = API_CONFIG.RETRY;

// 延迟函数
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 计算重试延迟（指数退避）
function calculateRetryDelay(attempt: number): number {
  const delay = RETRY_CONFIG.BASE_DELAY_MS * Math.pow(2, attempt);
  return Math.min(delay, RETRY_CONFIG.MAX_DELAY_MS);
}

// 构建优化的提示词
function buildOptimizedPrompt(request: ImageGenerationRequest): string {
  let prompt = request.prompt;
  
  // 如果有输入图片，优化为图片融合提示词
  if (request.inputImage) {
    prompt = `Based on the uploaded image, create a new travel photograph that seamlessly integrates the person/subject from the uploaded image into a beautiful scene at ${request.location || 'the specified location'}. 
    
    Instructions:
    - Keep the person's appearance, clothing, and pose from the original image
    - Place them naturally in the new location environment
    - Ensure realistic lighting and shadows that match the new environment
    - Maintain photorealistic quality and natural composition
    - Make it look like an authentic travel photo taken at the destination
    - Preserve the person's facial features and characteristics exactly
    
    ${request.prompt}`;
  } else {
    // 如果没有输入图片，使用原来的逻辑
    if (request.location) {
      prompt = `Create a beautiful, photorealistic travel image at ${request.location}. ${prompt}`;
    }
  }
  
  // 如果指定了风格，添加风格描述
  if (request.style) {
    prompt += ` Style: ${request.style}.`;
  }
  
  // 添加质量和细节要求
  prompt += ' High quality, detailed, professional travel photography, vibrant colors, excellent composition, natural lighting.';
  
  return prompt;
}

// 主要的图像生成函数
export async function generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= RETRY_CONFIG.MAX_ATTEMPTS; attempt++) {
    try {
      const client = getGeminiClient();
      const model = client.getGenerativeModel({ model: MODEL_NAME });
      
      const optimizedPrompt = buildOptimizedPrompt(request);
      
      console.log(`[Gemini] Generating image (attempt ${attempt + 1}/${RETRY_CONFIG.MAX_ATTEMPTS + 1}):`, {
        prompt: optimizedPrompt,
        location: request.location,
        style: request.style,
        hasInputImage: !!request.inputImage,
      });
      
      // 准备内容数组
      const contentParts: any[] = [
        { text: optimizedPrompt }
      ];
      
      // 如果有输入图片，添加到内容中
      if (request.inputImage && request.inputImageMimeType) {
        contentParts.push({
          inlineData: {
            data: request.inputImage,
            mimeType: request.inputImageMimeType
          }
        });
        console.log(`[Gemini] Including input image (${request.inputImageMimeType})`);
      }
      
      const result = await model.generateContent(contentParts);
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
      if (attempt === RETRY_CONFIG.MAX_ATTEMPTS) {
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
    error: `Failed to generate image after ${RETRY_CONFIG.MAX_ATTEMPTS + 1} attempts: ${errorMessage}`,
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