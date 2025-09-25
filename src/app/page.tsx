'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Camera, MapPin, Sparkles, Globe, Users, Zap } from "lucide-react";
import { useTranslation } from '@/hooks/use-translation';
import { useState, useEffect } from 'react';

export default function Home() {
  const { t, isHydrated } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 在水合完成之前显示加载状态
  if (!mounted || !isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Camera className="h-12 w-12 text-primary mx-auto mb-4" />
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }
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
                {t('nav.create')}
              </Link>
              <Link href="/gallery" className="text-sm font-medium hover:text-primary transition-colors">
                {t('nav.gallery')}
              </Link>
              <LanguageSwitcher />
              <UserAvatar />
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-primary">{t('home.title')}</span>
          </h1>
          <p className="text-2xl md:text-3xl mb-8 max-w-2xl mx-auto">
            <span className="text-foreground font-medium">{t('home.subtitle')}</span>
            <br />
            <br />
            <span className="text-muted-foreground text-lg md:text-xl">{t('home.description')}</span>
          </p>
          <Button size="lg" asChild className="mb-12">
            <Link href="/auth/signin">{t('home.cta')}</Link>
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
                <p className="text-lg font-medium">{t('home.features.title')}</p>
                <p className="text-muted-foreground mt-2">{t('home.features.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-secondary/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">{t('home.howItWorks.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.howItWorks.step1.title')}</h3>
              <p className="text-muted-foreground">
                {t('home.howItWorks.step1.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.howItWorks.step2.title')}</h3>
              <p className="text-muted-foreground">
                {t('home.howItWorks.step2.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.howItWorks.step3.title')}</h3>
              <p className="text-muted-foreground">
                {t('home.howItWorks.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">{t('home.whyUnique')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 border border-border rounded-lg text-center">
              <Globe className="h-8 w-8 text-primary mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">📍 {t('home.globalLocations')}</h3>
              <p className="text-muted-foreground">
                {t('home.globalLocationsDesc')}
              </p>
            </div>
            <div className="p-6 border border-border rounded-lg text-center">
              <Zap className="h-8 w-8 text-primary mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">⚡ {t('home.fastGeneration')}</h3>
              <p className="text-muted-foreground">
                {t('home.fastGenerationDesc')}
              </p>
            </div>
            <div className="p-6 border border-border rounded-lg text-center">
              <Users className="h-8 w-8 text-primary mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">🎁 {t('home.freeToUse')}</h3>
              <p className="text-muted-foreground">
                {t('home.freeToUseDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">{t('home.generateFirst')}</h2>
          <p className="text-xl mb-8 opacity-90">
            {t('home.description')}
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/signin">{t('home.cta')}</Link>
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
