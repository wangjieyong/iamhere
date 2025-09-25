// 错误处理工具类
import { FILE_LIMITS } from "./constants"

// 错误类型定义
export enum ErrorCode {
  // 认证错误
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  
  // 业务逻辑错误
  DAILY_LIMIT_EXCEEDED = 'DAILY_LIMIT_EXCEEDED',
  INVALID_IMAGE_FORMAT = 'INVALID_IMAGE_FORMAT',
  IMAGE_TOO_LARGE = 'IMAGE_TOO_LARGE',
  LOCATION_REQUIRED = 'LOCATION_REQUIRED',
  
  // 外部服务错误
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  
  // 系统错误
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

// 自定义错误类
export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.isOperational = isOperational
    
    Error.captureStackTrace(this, this.constructor)
  }
}

// 错误消息映射
const ERROR_MESSAGES: Record<ErrorCode, { zh: string; en: string }> = {
  [ErrorCode.UNAUTHORIZED]: {
    zh: '请先登录',
    en: 'Please sign in first'
  },
  [ErrorCode.FORBIDDEN]: {
    zh: '没有权限执行此操作',
    en: 'Permission denied'
  },
  [ErrorCode.DAILY_LIMIT_EXCEEDED]: {
    zh: '今日生成次数已达上限，请明天再试',
    en: 'Daily generation limit exceeded, please try again tomorrow'
  },
  [ErrorCode.INVALID_IMAGE_FORMAT]: {
    zh: '不支持的图片格式，请上传 JPG、PNG 或 WebP 格式的图片',
    en: 'Unsupported image format, please upload JPG, PNG or WebP images'
  },
  [ErrorCode.IMAGE_TOO_LARGE]: {
    zh: `图片文件过大，请上传小于 ${FILE_LIMITS.MAX_IMAGE_SIZE_MB}MB 的图片`,
    en: `Image file too large, please upload images smaller than ${FILE_LIMITS.MAX_IMAGE_SIZE_MB}MB`
  },
  [ErrorCode.LOCATION_REQUIRED]: {
    zh: '请选择一个地理位置',
    en: 'Please select a location'
  },
  [ErrorCode.AI_SERVICE_ERROR]: {
    zh: 'AI 服务暂时不可用，请稍后重试',
    en: 'AI service temporarily unavailable, please try again later'
  },
  [ErrorCode.STORAGE_ERROR]: {
    zh: '图片存储失败，请重试',
    en: 'Image storage failed, please try again'
  },
  [ErrorCode.DATABASE_ERROR]: {
    zh: '数据库操作失败，请重试',
    en: 'Database operation failed, please try again'
  },
  [ErrorCode.INTERNAL_SERVER_ERROR]: {
    zh: '服务器内部错误，请稍后重试',
    en: 'Internal server error, please try again later'
  },
  [ErrorCode.RATE_LIMIT_EXCEEDED]: {
    zh: '请求过于频繁，请稍后重试',
    en: 'Too many requests, please try again later'
  }
}

// 获取本地化错误消息
export function getErrorMessage(code: ErrorCode, language: string = 'zh'): string {
  const messages = ERROR_MESSAGES[code]
  return messages ? messages[language as keyof typeof messages] || messages.zh : '未知错误'
}

// 创建标准化错误响应
export function createErrorResponse(error: AppError | Error, language: string = 'zh') {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: getErrorMessage(error.code, language),
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    }
  }

  // 处理未知错误
  console.error('Unexpected error:', error)
  
  return {
    success: false,
    error: {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: getErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, language),
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }
  }
}

// 日志记录函数
export function logError(error: Error, context?: Record<string, unknown>) {
  const logData = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    context
  }

  if (process.env.NODE_ENV === 'production') {
    // 生产环境：发送到日志服务
    console.error(JSON.stringify(logData))
    
    // 这里可以集成第三方日志服务，如 Sentry
    // Sentry.captureException(error, { extra: context })
  } else {
    // 开发环境：详细输出
    console.error('Error occurred:', logData)
  }
}

// API 路由错误处理中间件
export function withErrorHandler<T extends unknown[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args)
    } catch (error) {
      logError(error as Error, { args })
      throw error
    }
  }
}

// 验证函数
export const validators = {
  // 验证图片文件
  validateImageFile(file: File): void {
    if (!FILE_LIMITS.ALLOWED_IMAGE_FORMATS.includes(file.type as any)) {
      throw new AppError(ErrorCode.INVALID_IMAGE_FORMAT, 'Invalid image format', 400)
    }

    if (file.size > FILE_LIMITS.MAX_IMAGE_SIZE_BYTES) {
      throw new AppError(ErrorCode.IMAGE_TOO_LARGE, 'Image file too large', 400)
    }
  },

  // 验证地理位置
  validateLocation(location: { lat?: number; lng?: number; address?: string }): void {
    if (!location.lat || !location.lng || !location.address) {
      throw new AppError(ErrorCode.LOCATION_REQUIRED, 'Location is required', 400)
    }

    if (Math.abs(location.lat) > 90 || Math.abs(location.lng) > 180) {
      throw new AppError(ErrorCode.LOCATION_REQUIRED, 'Invalid coordinates', 400)
    }
  },

  // 验证用户认证
  validateAuth(userId?: string): void {
    if (!userId) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401)
    }
  }
}