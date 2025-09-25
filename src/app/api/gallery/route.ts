import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AppError, ErrorCode, createErrorResponse, logError } from '@/lib/error-handler'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      const error = new AppError(ErrorCode.UNAUTHORIZED, 'Unauthorized access', 401)
      const errorResponse = createErrorResponse(error, 'zh')
      return NextResponse.json(errorResponse, { status: 401 })
    }

    // 首先获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      const error = new AppError(ErrorCode.UNAUTHORIZED, 'User not found', 404)
      const errorResponse = createErrorResponse(error, 'zh')
      return NextResponse.json(errorResponse, { status: 404 })
    }

    const userImages = await prisma.generatedImage.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        prompt: true,
        imageUrl: true,
        createdAt: true,
        location: true,
        locationLat: true,
        locationLng: true
      }
    })

    return NextResponse.json({
      images: userImages,
      total: userImages.length
    })

  } catch (error: unknown) {
    console.error('Gallery API error:', error)
    logError(error as Error, { endpoint: '/api/gallery' })
    
    const serverError = new AppError(ErrorCode.INTERNAL_SERVER_ERROR, 'Server error', 500)
    const errorResponse = createErrorResponse(serverError, 'zh')
    return NextResponse.json(errorResponse, { status: 500 })
  }
}