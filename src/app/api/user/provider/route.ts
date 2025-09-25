import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppError, ErrorCode, createErrorResponse, logError } from '@/lib/error-handler';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      const error = new AppError(ErrorCode.UNAUTHORIZED, 'Unauthorized access', 401)
      const errorResponse = createErrorResponse(error, 'zh')
      return NextResponse.json(errorResponse, { status: 401 })
    }

    // 获取用户的账户信息，包含provider
    const account = await prisma.account.findFirst({
      where: { userId: session.user.id },
      select: { provider: true }
    });

    if (!account) {
      const error = new AppError(ErrorCode.UNAUTHORIZED, 'Account not found', 404)
      const errorResponse = createErrorResponse(error, 'zh')
      return NextResponse.json(errorResponse, { status: 404 })
    }

    return NextResponse.json({
      provider: account.provider
    });

  } catch (error: unknown) {
    console.error('获取用户provider失败:', error);
    logError(error as Error, { endpoint: '/api/user/provider' })
    
    const serverError = new AppError(ErrorCode.INTERNAL_SERVER_ERROR, 'Server error', 500)
    const errorResponse = createErrorResponse(serverError, 'zh')
    return NextResponse.json(errorResponse, { status: 500 })
  }
}