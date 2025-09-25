import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { USER_LIMITS } from '@/lib/constants';
import { AppError, ErrorCode, createErrorResponse, logError } from '@/lib/error-handler';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      const error = new AppError(ErrorCode.UNAUTHORIZED, 'Unauthorized access', 401)
      const errorResponse = createErrorResponse(error, 'zh')
      return NextResponse.json(errorResponse, { status: 401 })
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        generatedImages: true,
        dailyUsage: true,
      },
    });

    if (!user) {
      const error = new AppError(ErrorCode.UNAUTHORIZED, 'User not found', 404)
      const errorResponse = createErrorResponse(error, 'zh')
      return NextResponse.json(errorResponse, { status: 404 })
    }

    // 计算总生成图片数
    const totalImages = user.generatedImages.length;

    // 获取今日使用量
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayUsage = user.dailyUsage.find((usage: { date: Date; count: number }) => {
      const usageDate = new Date(usage.date);
      usageDate.setHours(0, 0, 0, 0);
      return usageDate.getTime() === today.getTime();
    });

    const dailyUsage = todayUsage?.count || 0;

    return NextResponse.json({
      totalImages,
      dailyUsage,
      dailyLimit: USER_LIMITS.DAILY_GENERATION_LIMIT,
    });

  } catch (error: unknown) {
    console.error('获取用户统计失败:', error);
    logError(error as Error, { endpoint: '/api/user/stats' })
    
    const serverError = new AppError(ErrorCode.INTERNAL_SERVER_ERROR, 'Server error', 500)
    const errorResponse = createErrorResponse(serverError, 'zh')
    return NextResponse.json(errorResponse, { status: 500 })
  }
}