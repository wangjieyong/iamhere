/**
 * 业务逻辑常量配置
 * 
 * 集中管理所有业务相关的硬编码常量，提供类型安全和统一的配置管理
 */

// 🔒 用户限制常量
export const USER_LIMITS = {
  // 每日生成限制
  DAILY_GENERATION_LIMIT: 100,
  
  // 每日上传限制
  DAILY_UPLOAD_LIMIT: 50,
} as const;

// 📁 文件处理常量
export const FILE_LIMITS = {
  // 图片文件大小限制（MB）
  MAX_IMAGE_SIZE_MB: 20,
  
  // 图片文件大小限制（字节）
  MAX_IMAGE_SIZE_BYTES: 20 * 1024 * 1024,
  
  // 支持的图片格式
  ALLOWED_IMAGE_FORMATS: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ],
  
  // 文件名最大长度
  MAX_FILENAME_LENGTH: 255,
} as const;

// ⚡ API配置常量
export const API_CONFIG = {
  // 重试配置
  RETRY: {
    MAX_ATTEMPTS: 3,
    BASE_DELAY_MS: 1000,
    MAX_DELAY_MS: 10000,
  },
  
  // 超时配置
  TIMEOUT: {
    DEFAULT_MS: 10000,
    GEOCODING_MS: 5000,
    UPLOAD_MS: 30000,
  },
  
  // 速率限制
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 60,
    BURST_LIMIT: 10,
  },
} as const;

// 🗺️ 地图配置常量
export const MAP_CONFIG = {
  // Mapbox配置
  MAPBOX: {
    ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
    DEFAULT_STYLE: 'mapbox://styles/mapbox/streets-v12',
    DEFAULT_CENTER: { lng: 0, lat: 0 },
    DEFAULT_ZOOM: 10,
    GEOCODING: {
      BASE_URL: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
      LIMIT: 10,
      TYPES: ['country', 'region', 'postcode', 'district', 'place', 'locality', 'neighborhood', 'address', 'poi'],
      LANGUAGE: 'en'
    }
  },
  
  // 搜索结果限制
  SEARCH_LIMIT: 5,
} as const;

// 🎨 UI配置常量
export const UI_CONFIG = {
  // 动画时长
  ANIMATION: {
    DURATION_MS: 150,
    TRANSITION_MS: 300,
  },
  
  // 防抖延迟
  DEBOUNCE: {
    SEARCH_MS: 300,
    INPUT_MS: 500,
  },
  
  // 分页配置
  PAGINATION: {
    DEFAULT_SIZE: 20,
    MAX_SIZE: 100,
  },
  
  // 尺寸配置
  SIZE: {
    AVATAR_SM: 32,
    AVATAR_MD: 40,
    AVATAR_LG: 64,
    BUTTON_HEIGHT: 40,
    INPUT_HEIGHT: 40,
  },
} as const;

// 💰 计费和定价常量
export const PRICING_CONFIG = {
  // Gemini API定价（每百万token）
  GEMINI: {
    PER_MILLION_TOKENS: 0.00015,
  },
  
  // 图片处理定价
  IMAGE: {
    PROCESSING_COST: 0.001,
  },
} as const;

// 🔍 搜索配置常量
export const SEARCH_CONFIG = {
  // 搜索结果限制
  MAX_RESULTS: 50,
  
  // 搜索查询最小长度
  MIN_QUERY_LENGTH: 2,
  
  // 搜索查询最大长度
  MAX_QUERY_LENGTH: 100,
} as const;

// 📊 监控和分析常量
export const MONITORING_CONFIG = {
  // 事件类型
  EVENTS: {
    USER_SIGNUP: 'user_signup',
    IMAGE_UPLOAD: 'image_upload',
    GENERATION_REQUEST: 'generation_request',
    ERROR_OCCURRED: 'error_occurred',
  },
  
  // 采样率
  SAMPLING_RATE: 0.1,
} as const;

// 🔐 安全配置常量
export const SECURITY_CONFIG = {
  // 密码要求
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
  },
  
  // 会话配置
  SESSION: {
    MAX_AGE_SECONDS: 30 * 24 * 60 * 60, // 30天
  },
  
  // CORS配置
  CORS: {
    MAX_AGE_SECONDS: 86400, // 24小时
  },
} as const;

// 📱 响应式断点常量
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// 🎯 业务常量聚合导出
export const BUSINESS_CONSTANTS = {
  USER_LIMITS,
  FILE_LIMITS,
  API_CONFIG,
  MAP_CONFIG,
  UI_CONFIG,
  PRICING_CONFIG,
  SEARCH_CONFIG,
  MONITORING_CONFIG,
  SECURITY_CONFIG,
  BREAKPOINTS,
} as const;

// 类型导出
export type UserLimits = typeof USER_LIMITS;
export type FileLimits = typeof FILE_LIMITS;
export type ApiConfig = typeof API_CONFIG;
export type MapConfig = typeof MAP_CONFIG;
export type UiConfig = typeof UI_CONFIG;
export type PricingConfig = typeof PRICING_CONFIG;
export type SearchConfig = typeof SEARCH_CONFIG;
export type MonitoringConfig = typeof MONITORING_CONFIG;
export type SecurityConfig = typeof SECURITY_CONFIG;
export type Breakpoints = typeof BREAKPOINTS;
export type BusinessConstants = typeof BUSINESS_CONSTANTS;

// 默认导出
export default BUSINESS_CONSTANTS;