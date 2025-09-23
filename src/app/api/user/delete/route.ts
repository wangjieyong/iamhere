import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 删除用户相关的所有数据
    await prisma.$transaction(async (tx) => {
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
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}