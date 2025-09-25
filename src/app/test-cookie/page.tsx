'use client';

import { useState, useEffect } from 'react';
import { getLocale, setLocale, setCookie } from '@/lib/i18n';

export default function TestCookiePage() {
  const [currentLocale, setCurrentLocale] = useState<string>('');
  const [cookieValue, setCookieValue] = useState<string>('');

  useEffect(() => {
    // 获取当前语言
    const locale = getLocale();
    setCurrentLocale(locale);
    
    // 直接读取cookie
    const cookieLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith('locale='))
      ?.split('=')[1] || 'not found';
    setCookieValue(cookieLocale);
  }, []);

  const handleSetChinese = () => {
    setLocale('zh');
    // 重新读取
    setTimeout(() => {
      const locale = getLocale();
      setCurrentLocale(locale);
      const cookieLocale = document.cookie
        .split('; ')
        .find(row => row.startsWith('locale='))
        ?.split('=')[1] || 'not found';
      setCookieValue(cookieLocale);
    }, 100);
  };

  const handleSetEnglish = () => {
    setLocale('en');
    // 重新读取
    setTimeout(() => {
      const locale = getLocale();
      setCurrentLocale(locale);
      const cookieLocale = document.cookie
        .split('; ')
        .find(row => row.startsWith('locale='))
        ?.split('=')[1] || 'not found';
      setCookieValue(cookieLocale);
    }, 100);
  };

  const handleClearCookie = () => {
    document.cookie = 'locale=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setTimeout(() => {
      const locale = getLocale();
      setCurrentLocale(locale);
      const cookieLocale = document.cookie
        .split('; ')
        .find(row => row.startsWith('locale='))
        ?.split('=')[1] || 'not found';
      setCookieValue(cookieLocale);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Cookie 功能测试</h1>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded">
            <h2 className="font-semibold mb-2">当前状态</h2>
            <p><strong>getLocale() 返回:</strong> {currentLocale}</p>
            <p><strong>Cookie 值:</strong> {cookieValue}</p>
          </div>

          <div className="space-x-4">
            <button 
              onClick={handleSetChinese}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              设置为中文 (zh)
            </button>
            <button 
              onClick={handleSetEnglish}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              设置为英文 (en)
            </button>
            <button 
              onClick={handleClearCookie}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              清除 Cookie
            </button>
          </div>

          <div className="bg-yellow-50 p-4 rounded">
            <h2 className="font-semibold mb-2">测试说明</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>点击按钮后，上方的状态应该立即更新</li>
              <li>刷新页面后，语言设置应该保持</li>
              <li>清除Cookie后，应该回到默认语言（英文）</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}