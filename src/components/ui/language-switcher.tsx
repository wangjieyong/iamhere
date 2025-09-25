'use client';

import { useTranslation } from '@/hooks/use-translation';
import Image from 'next/image';

export function LanguageSwitcher() {
  const { locale, setLocale, isHydrated, isInitialized } = useTranslation();

  const toggleLanguage = () => {
    const newLocale = locale === 'zh' ? 'en' : 'zh';
    setLocale(newLocale);
    // 刷新页面以确保语言切换立即生效
    window.location.reload();
  };

  // 在hydration完成前显示加载状态，避免闪烁
  if (!isHydrated || !isInitialized) {
    return (
      <span className="text-gray-400 flex items-center gap-1">
        <Image src="/globe.svg" alt="Language" width={16} height={16} />
        EN
      </span>
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      className="text-gray-700 hover:text-black transition-colors flex items-center gap-1"
      title={`Switch to ${locale === 'zh' ? 'English' : '中文'}`}
    >
      <Image src="/globe.svg" alt="Language" width={16} height={16} />
      {locale === 'zh' ? '中文' : 'EN'}
    </button>
  );
}