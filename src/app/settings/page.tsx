'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { User, Globe, LogOut, Camera, Download, Trash2, Settings as SettingsIcon } from 'lucide-react';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

// 临时内联组件定义，避免导入问题
const Card = ({ children, className = '', ...props }: any) => (
  <div className={`rounded-lg border bg-white shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '', ...props }: any) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '', ...props }: any) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = '', ...props }: any) => (
  <p className={`text-sm text-gray-600 ${className}`} {...props}>
    {children}
  </p>
);

const CardContent = ({ children, className = '', ...props }: any) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

const Avatar = ({ children, className = '', ...props }: any) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`} {...props}>
    {children}
  </div>
);

const AvatarImage = ({ src, alt, className = '', ...props }: any) => {
  // 如果src为空字符串、null或undefined，则不渲染img元素
  if (!src) {
    return null;
  }
  return (
    <img src={src} alt={alt} className={`aspect-square h-full w-full object-cover ${className}`} {...props} />
  );
};

const AvatarFallback = ({ children, className = '', ...props }: any) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-sm font-medium ${className}`} {...props}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default', className = '', ...props }: any) => {
  const variantClasses: { [key: string]: string } = {
    default: 'bg-blue-500 text-white',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-700'
  };
  const variantClass = variantClasses[variant] || variantClasses.default;
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

const Separator = ({ className = '', ...props }: any) => (
  <div className={`h-[1px] w-full bg-gray-200 ${className}`} {...props} />
);

interface UserStats {
  totalImages: number;
  dailyUsage: number;
  dailyLimit: number;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats>({
    totalImages: 0,
    dailyUsage: 0,
    dailyLimit: 3
  });
  const [isLoading, setIsLoading] = useState(true);
  const { showConfirm, ConfirmDialog } = useConfirmDialog();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (session?.user) {
      fetchUserStats();
    }
  }, [session, status, router]);

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/user/stats');
      if (response.ok) {
        const stats = await response.json();
        setUserStats(stats);
      }
    } catch (error) {
      console.error('获取用户统计失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleDeleteAccount = async () => {
    showConfirm({
      title: "删除账户",
      message: "确定要删除账户吗？此操作不可撤销，将删除您的所有数据。",
      confirmText: "删除账户",
      cancelText: "取消",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const response = await fetch('/api/user/delete', {
            method: 'DELETE',
          });
          
          if (response.ok) {
            await signOut({ callbackUrl: '/' });
          } else {
            alert('删除账户失败，请稍后重试');
          }
        } catch (error) {
          console.error('删除账户失败:', error);
          alert('删除账户失败，请稍后重试');
        }
      }
    });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground"
            >
              ← 返回
            </Button>
            <div className="flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold">账户设置</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* 用户信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>个人信息</span>
              </CardTitle>
              <CardDescription>
                您的基本账户信息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                  <AvatarFallback className="text-lg">
                    {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">{session.user.name || '未设置姓名'}</h3>
                  <p className="text-muted-foreground">{session.user.email}</p>
                  <Badge variant="secondary" className="text-xs">
                    Google 账户
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 使用统计卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="h-5 w-5" />
                <span>使用统计</span>
              </CardTitle>
              <CardDescription>
                您的图片生成使用情况
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{userStats.totalImages}</div>
                  <div className="text-sm text-muted-foreground">总生成图片</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{userStats.dailyUsage}</div>
                  <div className="text-sm text-muted-foreground">今日已使用</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-muted-foreground">{userStats.dailyLimit}</div>
                  <div className="text-sm text-muted-foreground">每日限额</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>今日使用进度</span>
                  <span>{userStats.dailyUsage}/{userStats.dailyLimit}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((userStats.dailyUsage / userStats.dailyLimit) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 语言设置卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>语言设置</span>
              </CardTitle>
              <CardDescription>
                选择您的首选语言
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-primary/5 border-primary">
                  <div>
                    <div className="font-medium">简体中文</div>
                    <div className="text-sm text-muted-foreground">Simplified Chinese</div>
                  </div>
                  <Badge variant="default">当前</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
                  <div>
                    <div className="font-medium">English</div>
                    <div className="text-sm text-muted-foreground">English (US)</div>
                  </div>
                  <Badge variant="outline">即将推出</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 快捷操作卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>快捷操作</CardTitle>
              <CardDescription>
                常用功能的快速访问
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/gallery')}
              >
                <Download className="h-4 w-4 mr-2" />
                查看我的图库
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/create')}
              >
                <Camera className="h-4 w-4 mr-2" />
                创建新图片
              </Button>
            </CardContent>
          </Card>

          <Separator />

          {/* 账户操作卡片 */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">账户操作</CardTitle>
              <CardDescription>
                退出登录或删除账户
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                退出登录
              </Button>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={handleDeleteAccount}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除账户
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 确认对话框 */}
      <ConfirmDialog />
    </div>
  );
}