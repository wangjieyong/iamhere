import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Camera, MapPin, Sparkles, Globe, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Navigation */}
          <nav className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <Camera className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">IAmHere</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/create" className="text-sm font-medium hover:text-primary transition-colors">
                开始创作
              </Link>
              <Link href="/gallery" className="text-sm font-medium hover:text-primary transition-colors">
                图库
              </Link>
              <UserAvatar />
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            AI 带你环游世界，
            <br />
            <span className="text-primary">只需一张自拍</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            用户上传自拍，在世界地图选点，AI生成身临其境的旅行大片。
            不是假装旅行，而是打破时空限制，创造虚实交织的影像艺术。
          </p>
          <Button size="lg" asChild className="mb-12">
            <Link href="/auth/signin">立即体验</Link>
          </Button>
          
          {/* Feature Preview */}
          <div className="bg-secondary rounded-lg p-8 max-w-3xl mx-auto">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <Camera className="h-8 w-8 text-primary" />
                  <span className="text-2xl">+</span>
                  <MapPin className="h-8 w-8 text-primary" />
                  <span className="text-2xl">=</span>
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <p className="text-lg font-medium">AI旅行影像生成</p>
                <p className="text-muted-foreground mt-2">上传自拍 + 选择地点 = 专属旅行大片</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-secondary/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">如何使用</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. 上传自拍</h3>
              <p className="text-muted-foreground">
                上传一张包含人物的照片，支持 JPG、PNG、HEIC 格式，最大 20MB
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. 选择地点</h3>
              <p className="text-muted-foreground">
                在世界地图上选择你想要"到达"的地点，或者搜索具体的地名
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. AI 生成</h3>
              <p className="text-muted-foreground">
                AI 将你的照片与选择的地点完美融合，生成专属的旅行大片
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">功能特性</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 border border-border rounded-lg">
              <Globe className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">全球地点</h3>
              <p className="text-muted-foreground">
                支持全球任意地点选择，从著名景点到隐秘角落
              </p>
            </div>
            <div className="p-6 border border-border rounded-lg">
              <Zap className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">快速生成</h3>
              <p className="text-muted-foreground">
                AI 快速处理，30秒内生成高质量旅行照片
              </p>
            </div>
            <div className="p-6 border border-border rounded-lg">
              <Users className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">免费使用</h3>
              <p className="text-muted-foreground">
                每日3次免费生成额度，无水印，标准质量输出
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">开始你的AI旅行之旅</h2>
          <p className="text-xl mb-8 opacity-90">
            创造"在场"，成为创意表达与超现实时空穿越的首选工具
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/signin">免费开始创作</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Camera className="h-5 w-5 text-primary" />
            <span className="font-semibold">IAmHere</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2025 IAmHere. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
