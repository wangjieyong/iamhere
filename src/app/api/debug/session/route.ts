import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 检查session
    const session = await getServerSession(authOptions)
    
    // 检查数据库连接
    let dbStatus = 'unknown'
    let userCount = 0
    let sessionCount = 0
    
    try {
      userCount = await prisma.user.count()
      sessionCount = await prisma.session.count()
      dbStatus = 'connected'
    } catch (dbError: any) {
      dbStatus = `error: ${dbError.message}`
    }
    
    return NextResponse.json({
      session: session,
      hasSession: !!session,
      database: {
        status: dbStatus,
        userCount,
        sessionCount
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nextauthUrl: process.env.NEXTAUTH_URL,
        hasNextauthSecret: !!process.env.NEXTAUTH_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}