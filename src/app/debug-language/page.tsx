'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { getLocale, setLocale, t } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

export default function DebugLanguagePage() {
  const { t: hookT, locale: hookLocale, setLocale: hookSetLocale, isHydrated } = useTranslation();
  const [directLocale, setDirectLocale] = useState<string>('');
  const [cookieValue, setCookieValue] = useState<string>('');
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    // 强制重新渲染计数
    setRenderCount(prev => prev + 1);
    
    // 直接获取locale
    const currentLocale = getLocale();
    setDirectLocale(currentLocale);
    
    // 获取Cookie值
    const cookies = document.cookie.split(';');
    const localeCookie = cookies.find(cookie => cookie.trim().startsWith('locale='));
    setCookieValue(localeCookie ? localeCookie.split('=')[1] : 'not found');
  }, [hookLocale]);

  const testDirectTranslation = () => {
    return {
      zh: t('home.title', 'zh'),
      en: t('home.title', 'en'),
      current: t('home.title'),
    };
  };

  const handleDirectLocaleChange = (newLocale: 'zh' | 'en') => {
    setLocale(newLocale);
    // 强制刷新状态
    setTimeout(() => {
      const currentLocale = getLocale();
      setDirectLocale(currentLocale);
      
      const cookies = document.cookie.split(';');
      const localeCookie = cookies.find(cookie => cookie.trim().startsWith('locale='));
      setCookieValue(localeCookie ? localeCookie.split('=')[1] : 'not found');
    }, 100);
  };

  const translations = testDirectTranslation();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">语言切换调试页面</h1>
        
        {/* 语言切换器 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">语言切换器</h2>
          <LanguageSwitcher />
        </div>

        {/* 状态信息 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">状态信息</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Hook Locale:</strong> {hookLocale}
            </div>
            <div>
              <strong>Direct Locale:</strong> {directLocale}
            </div>
            <div>
              <strong>Cookie Value:</strong> {cookieValue}
            </div>
            <div>
              <strong>Is Hydrated:</strong> {isHydrated ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Render Count:</strong> {renderCount}
            </div>
          </div>
        </div>

        {/* 翻译测试 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">翻译测试</h2>
          <div className="space-y-2">
            <div>
              <strong>Hook Translation (home.title):</strong> {hookT('home.title')}
            </div>
            <div>
              <strong>Direct Translation (zh):</strong> {translations.zh}
            </div>
            <div>
              <strong>Direct Translation (en):</strong> {translations.en}
            </div>
            <div>
              <strong>Direct Translation (current):</strong> {translations.current}
            </div>
          </div>
        </div>

        {/* 手动切换按钮 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">手动切换测试</h2>
          <div className="space-x-4">
            <button
              onClick={() => hookSetLocale('zh')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Hook 切换到中文
            </button>
            <button
              onClick={() => hookSetLocale('en')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Hook 切换到英文
            </button>
            <button
              onClick={() => handleDirectLocaleChange('zh')}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              直接切换到中文
            </button>
            <button
              onClick={() => handleDirectLocaleChange('en')}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              直接切换到英文
            </button>
          </div>
        </div>

        {/* 更多翻译示例 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">更多翻译示例</h2>
          <div className="space-y-2">
            <div>
              <strong>home.subtitle:</strong> {hookT('home.subtitle')}
            </div>
            <div>
              <strong>home.description:</strong> {hookT('home.description')}
            </div>
            <div>
              <strong>home.cta:</strong> {hookT('home.cta')}
            </div>
            <div>
              <strong>nav.home:</strong> {hookT('nav.home')}
            </div>
            <div>
              <strong>nav.create:</strong> {hookT('nav.create')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}