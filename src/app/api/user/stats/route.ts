import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        generatedImages: true,
        dailyUsage: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
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
    const dailyLimit = 100; // 每日限额

    return NextResponse.json({
      totalImages,
      dailyUsage,
      dailyLimit,
    });

  } catch (error: unknown) {
    console.error('获取用户统计失败:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: '服务器错误', details: errorMessage },
      { status: 500 }
    );
  }
}