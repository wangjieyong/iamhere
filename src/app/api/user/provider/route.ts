import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 获取用户的账户信息，包含provider
    const account = await prisma.account.findFirst({
      where: { userId: session.user.id },
      select: { provider: true }
    });

    if (!account) {
      return NextResponse.json({ error: '未找到账户信息' }, { status: 404 });
    }

    return NextResponse.json({
      provider: account.provider
    });

  } catch (error: unknown) {
    console.error('获取用户provider失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}