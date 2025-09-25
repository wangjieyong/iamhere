'use client';

import { useTranslation } from '@/hooks/use-translation';

export default function TestSimplePage() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">简单语言测试</h1>
      
      <div className="space-y-6">
        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">当前状态</h2>
          <p>当前语言: {locale}</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">翻译测试</h2>
          <div className="space-y-2">
            <p><strong>home.title:</strong> {t('home.title')}</p>
            <p><strong>nav.create:</strong> {t('nav.create')}</p>
            <p><strong>nav.gallery:</strong> {t('nav.gallery')}</p>
            <p><strong>home.subtitle:</strong> {t('home.subtitle')}</p>
          </div>
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">语言切换</h2>
          <div className="space-x-4">
            <button 
              onClick={() => setLocale('zh')} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              切换到中文
            </button>
            <button 
              onClick={() => setLocale('en')} 
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Switch to English
            </button>
          </div>
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">预期结果</h2>
          <p>中文时应该显示: "此刻，身在四方。"</p>
          <p>英文时应该显示: "Here, Everywhere."</p>
          <p><strong>实际显示:</strong> {t('home.title')}</p>
        </div>
      </div>
    </div>
  );
}