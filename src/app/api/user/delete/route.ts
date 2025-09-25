import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppError, ErrorCode, createErrorResponse, logError } from '@/lib/error-handler';
import { Prisma } from '@prisma/client';

export async function DELETE() {
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
    });

    if (!user) {
      const error = new AppError(ErrorCode.UNAUTHORIZED, 'User not found', 404)
      const errorResponse = createErrorResponse(error, 'zh')
      return NextResponse.json(errorResponse, { status: 404 })
    }

    // 删除用户相关的所有数据
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 删除生成的图片记录
      await tx.generatedImage.deleteMany({
        where: { userId: user.id },
      });

      // 删除每日使用记录
      await tx.dailyUsage.deleteMany({
        where: { userId: user.id },
      });

      // 删除账户记录
      await tx.account.deleteMany({
        where: { userId: user.id },
      });

      // 删除会话记录
      await tx.session.deleteMany({
        where: { userId: user.id },
      });

      // 最后删除用户
      await tx.user.delete({
        where: { id: user.id },
      });
    });

    return NextResponse.json({ 
      message: '账户删除成功' 
    });

  } catch (error: unknown) {
    console.error('删除账户失败:', error);
    logError(error as Error, { endpoint: '/api/user/delete' })
    
    const serverError = new AppError(ErrorCode.INTERNAL_SERVER_ERROR, 'Server error', 500)
    const errorResponse = createErrorResponse(serverError, 'zh')
    return NextResponse.json(errorResponse, { status: 500 })
  }
}