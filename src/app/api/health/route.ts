import { NextResponse } from 'next/server'
import { healthChecker } from '@/lib/monitoring'

export async function GET() {
  try {
    const healthStatus = await healthChecker.getHealthStatus()
    
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503
    
    return NextResponse.json(healthStatus, { status: statusCode })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
}