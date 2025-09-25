'use client';

import { useTranslation } from '@/hooks/use-translation';
import { useState, useEffect } from 'react';

export default function TestLangFinalPage() {
  const { t, locale, setLocale } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">语言切换最终测试</h1>
        
        {/* 当前状态 */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">当前状态</h2>
          <p><strong>当前语言:</strong> {locale}</p>
          <p><strong>组件已挂载:</strong> {mounted ? '是' : '否'}</p>
        </div>

        {/* 语言切换按钮 */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">语言切换</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setLocale('zh')}
              className={`px-4 py-2 rounded ${
                locale === 'zh' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              中文
            </button>
            <button
              onClick={() => setLocale('en')}
              className={`px-4 py-2 rounded ${
                locale === 'en' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* 翻译测试 */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">翻译测试</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">导航相关</h3>
              <p><strong>nav.create:</strong> {t('nav.create')}</p>
              <p><strong>nav.gallery:</strong> {t('nav.gallery')}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">首页相关</h3>
              <p><strong>home.title:</strong> {t('home.title')}</p>
              <p><strong>home.subtitle:</strong> {t('home.subtitle')}</p>
              <p><strong>home.description:</strong> {t('home.description')}</p>
              <p><strong>home.cta:</strong> {t('home.cta')}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">创建页面</h3>
              <p><strong>create.title:</strong> {t('create.title')}</p>
              <p><strong>create.subtitle:</strong> {t('create.subtitle')}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">图库页面</h3>
              <p><strong>gallery.title:</strong> {t('gallery.title')}</p>
              <p><strong>gallery.myGallery:</strong> {t('gallery.myGallery')}</p>
            </div>
          </div>
        </div>

        {/* 预期结果 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">预期结果</h2>
          <div className="text-sm text-gray-600">
            <p><strong>中文模式下应该显示:</strong></p>
            <ul className="list-disc list-inside ml-4 mb-4">
              <li>nav.create: 开始创作</li>
              <li>nav.gallery: 图库</li>
              <li>home.title: 此刻，身在四方。</li>
              <li>home.subtitle: AI 带你环游世界，只需一张自拍。</li>
              <li>create.title: 创造你的AI旅行体验</li>
              <li>gallery.title: 我的AI旅行图片</li>
            </ul>
            
            <p><strong>英文模式下应该显示:</strong></p>
            <ul className="list-disc list-inside ml-4">
              <li>nav.create: Create</li>
              <li>nav.gallery: Gallery</li>
              <li>home.title: Here, Everywhere.</li>
              <li>home.subtitle: AI takes you around the world with just a selfie.</li>
              <li>create.title: Create Your AI Travel Experience</li>
              <li>gallery.title: My AI Travel Photos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}