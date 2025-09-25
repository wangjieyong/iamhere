'use client';

import { useState, useEffect, useMemo } from 'react';
import { getLocale, setLocale as setI18nLocale, t as i18nT, type Locale } from '@/lib/i18n';

export function useTranslation() {
  // 初始状态：服务器端和客户端都使用英文，避免SSR不匹配
  const [locale, setLocaleState] = useState<Locale>('en');
  const [isHydrated, setIsHydrated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 客户端hydration后，读取Cookie中的真实locale
    const currentLocale = getLocale();
    
    // 设置hydration完成标志
    setIsHydrated(true);
    
    // 如果Cookie中的locale与当前状态不同，则更新
    if (currentLocale !== locale) {
      setLocaleState(currentLocale);
    }
    
    // 标记初始化完成
    setIsInitialized(true);
  }, []); // 保持空依赖数组，只在初始化时执行

  const handleSetLocale = (newLocale: Locale) => {
    // 立即更新状态 - 这是关键修复
    setLocaleState(newLocale);
    // 更新Cookie
    setI18nLocale(newLocale);
  };

  // 翻译函数：在hydration完成前使用英文，完成后使用实际locale
  const translateFunction = useMemo(() => {
    return (key: string) => {
      // 在hydration完成前，强制使用英文避免不匹配
      const effectiveLocale = isHydrated ? locale : 'en';
      return i18nT(key, effectiveLocale);
    };
  }, [locale, isHydrated]);

  return {
    locale,
    setLocale: handleSetLocale,
    t: translateFunction,
    isHydrated,
    isInitialized,
  };
}