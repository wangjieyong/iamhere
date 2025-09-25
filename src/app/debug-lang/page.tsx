'use client';

import { useTranslation } from '@/hooks/use-translation';
import { getLocale, t as directT } from '@/lib/i18n';
import { useEffect, useState } from 'react';

export default function DebugLangPage() {
  const { t, locale, setLocale } = useTranslation();
  const [cookies, setCookies] = useState<string>('');
  const [getLocaleResult, setGetLocaleResult] = useState<string>('');
  const [directTranslation, setDirectTranslation] = useState<{zh: string, en: string}>({zh: '', en: ''});

  useEffect(() => {
    // 获取所有 cookies
    setCookies(document.cookie);
    // 获取 getLocale 的结果
    setGetLocaleResult(getLocale());
    // 直接测试翻译函数
    setDirectTranslation({
      zh: directT('home.title', 'zh'),
      en: directT('home.title', 'en')
    });
  }, [locale]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">语言调试页面</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold">useTranslation Hook 状态:</h2>
          <p>locale: {locale}</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">Cookie 状态:</h2>
          <p>{cookies || '无 cookies'}</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">getLocale() 返回值:</h2>
          <p>{getLocaleResult}</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">直接翻译函数测试:</h2>
          <p>directT('home.title', 'zh'): {directTranslation.zh}</p>
          <p>directT('home.title', 'en'): {directTranslation.en}</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">useTranslation Hook 翻译测试:</h2>
          <p>t('home.title'): {t('home.title')}</p>
          <p>t('nav.create'): {t('nav.create')}</p>
          <p>t('home.subtitle'): {t('home.subtitle')}</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">手动切换语言:</h2>
          <button 
            onClick={() => setLocale('zh')} 
            className="mr-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            切换到中文
          </button>
          <button 
            onClick={() => setLocale('en')} 
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            切换到英文
          </button>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">实时状态监控:</h2>
          <p>当前时间: {new Date().toLocaleTimeString()}</p>
          <p>页面渲染语言: {locale}</p>
          <p>实际显示内容: {t('home.title')}</p>
        </div>
      </div>
    </div>
  );
}