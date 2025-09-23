import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    console.log('Testing database connection...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL)
    
    // 尝试简单的数据库查询
    const userCount = await prisma.user.count()
    console.log('Database connection successful, user count:', userCount)
    
    return NextResponse.json({
      success: true,
      message: "数据库连接成功",
      userCount,
      databaseUrl: process.env.DATABASE_URL
    })
  } catch (error) {
    console.error('Database connection failed:', error)
    return NextResponse.json({
      success: false,
      message: "数据库连接失败",
      error: error instanceof Error ? error.message : String(error),
      databaseUrl: process.env.DATABASE_URL
    }, { status: 500 })
  }
}