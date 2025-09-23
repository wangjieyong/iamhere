// 监控和分析工具
export interface AnalyticsEvent {
  event: string
  properties?: Record<string, unknown>
  userId?: string
  timestamp?: Date
}

export interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count'
  timestamp: Date
  metadata?: Record<string, unknown>
}

// 分析事件类型
export enum EventType {
  // 用户行为
  USER_SIGNUP = 'user_signup',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  
  // 核心功能
  IMAGE_UPLOAD = 'image_upload',
  LOCATION_SELECT = 'location_select',
  IMAGE_GENERATE = 'image_generate',
  IMAGE_DOWNLOAD = 'image_download',
  IMAGE_DELETE = 'image_delete',
  
  // 错误事件
  ERROR_OCCURRED = 'error_occurred',
  API_ERROR = 'api_error',
  
  // 性能事件
  PAGE_LOAD = 'page_load',
  API_RESPONSE_TIME = 'api_response_time'
}

// 分析服务类
class AnalyticsService {
  private isProduction = process.env.NODE_ENV === 'production'
  private enableAnalytics = process.env.ENABLE_ANALYTICS === 'true'

  // 记录事件
  async track(event: EventType, properties?: Record<string, unknown>, userId?: string) {
    if (!this.enableAnalytics) return

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
      },
      userId,
      timestamp: new Date()
    }

    if (this.isProduction) {
      // 生产环境：发送到分析服务
      await this.sendToAnalyticsService(analyticsEvent)
    } else {
      // 开发环境：控制台输出
      console.log('📊 Analytics Event:', analyticsEvent)
    }
  }

  // 记录性能指标
  async trackPerformance(metric: PerformanceMetric) {
    if (!this.enableAnalytics) return

    if (this.isProduction) {
      await this.sendPerformanceMetric(metric)
    } else {
      console.log('⚡ Performance Metric:', metric)
    }
  }

  // 记录错误
  async trackError(error: Error, context?: Record<string, unknown>, userId?: string) {
    await this.track(EventType.ERROR_OCCURRED, {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
      ...context
    }, userId)
  }

  // 发送到分析服务（可集成Google Analytics、Mixpanel等）
  private async sendToAnalyticsService(event: AnalyticsEvent) {
    try {
      // 这里可以集成第三方分析服务
      // 例如：Google Analytics 4, Mixpanel, PostHog等
      
      // Google Analytics 4 示例
      if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
        (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', event.event, {
          ...event.properties,
          user_id: event.userId
        })
      }

      // 或者发送到自定义分析端点
      if (process.env.ANALYTICS_ENDPOINT) {
        await fetch(process.env.ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event)
        })
      }
    } catch (error) {
      console.error('Failed to send analytics event:', error)
    }
  }

  // 发送性能指标
  private async sendPerformanceMetric(metric: PerformanceMetric) {
    try {
      if (process.env.METRICS_ENDPOINT) {
        await fetch(process.env.METRICS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metric)
        })
      }
    } catch (error) {
      console.error('Failed to send performance metric:', error)
    }
  }
}

// 性能监控工具
export class PerformanceMonitor {
  private startTimes: Map<string, number> = new Map()

  // 开始计时
  start(name: string) {
    this.startTimes.set(name, Date.now())
  }

  // 结束计时并记录
  async end(name: string, metadata?: Record<string, unknown>) {
    const startTime = this.startTimes.get(name)
    if (!startTime) return

    const duration = Date.now() - startTime
    this.startTimes.delete(name)

    const metric: PerformanceMetric = {
      name,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      metadata
    }

    await analytics.trackPerformance(metric)
    return duration
  }

  // 记录内存使用
  async recordMemoryUsage(context?: string) {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage()
      
      await analytics.trackPerformance({
        name: 'memory_usage_rss',
        value: memUsage.rss,
        unit: 'bytes',
        timestamp: new Date(),
        metadata: { context, type: 'rss' }
      })

      await analytics.trackPerformance({
        name: 'memory_usage_heap_used',
        value: memUsage.heapUsed,
        unit: 'bytes',
        timestamp: new Date(),
        metadata: { context, type: 'heap_used' }
      })
    }
  }
}

// 健康检查工具
export class HealthChecker {
  // 检查数据库连接
  async checkDatabase(): Promise<{ status: 'healthy' | 'unhealthy', details?: string }> {
    try {
      const { prisma } = await import('@/lib/prisma')
      await prisma.$queryRaw`SELECT 1`
      return { status: 'healthy' }
    } catch (error) {
      return { 
        status: 'unhealthy', 
        details: error instanceof Error ? error.message : 'Unknown database error' 
      }
    }
  }

  // 检查外部API服务
  async checkExternalServices(): Promise<Record<string, { status: 'healthy' | 'unhealthy', details?: string }>> {
    const results: Record<string, { status: 'healthy' | 'unhealthy', details?: string }> = {}

    // 检查Google AI API
    try {
      const apiKey = process.env.GOOGLE_AI_API_KEY
      if (apiKey && apiKey !== 'your-google-ai-api-key') {
        // 简单的API可用性检查
        results.google_ai = { status: 'healthy' }
      } else {
        results.google_ai = { status: 'unhealthy', details: 'API key not configured' }
      }
    } catch (error) {
      results.google_ai = { 
        status: 'unhealthy', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }
    }

    // 检查Mapbox API
    try {
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      if (mapboxToken && mapboxToken !== 'your-mapbox-access-token') {
        results.mapbox = { status: 'healthy' }
      } else {
        results.mapbox = { status: 'unhealthy', details: 'Access token not configured' }
      }
    } catch (error) {
      results.mapbox = { 
        status: 'unhealthy', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }
    }

    return results
  }

  // 综合健康检查
  async getHealthStatus() {
    const database = await this.checkDatabase()
    const externalServices = await this.checkExternalServices()

    const allHealthy = database.status === 'healthy' && 
      Object.values(externalServices).every(service => service.status === 'healthy')

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        database,
        external_services: externalServices
      }
    }
  }
}

// 导出单例实例
export const analytics = new AnalyticsService()
export const performanceMonitor = new PerformanceMonitor()
export const healthChecker = new HealthChecker()

// 中间件：API性能监控
export function withPerformanceMonitoring<T extends unknown[], R>(
  name: string,
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    performanceMonitor.start(name)
    
    try {
      const result = await handler(...args)
      await performanceMonitor.end(name, { success: true })
      return result
    } catch (error) {
      await performanceMonitor.end(name, { success: false, error: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  }
}