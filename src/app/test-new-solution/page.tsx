'use client';

import { useTranslation } from '@/hooks/use-translation';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

export default function TestNewSolutionPage() {
  const { t, locale, isHydrated, isInitialized } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h1 className="text-3xl font-bold mb-4">新语言切换解决方案测试</h1>
          
          {/* 状态指示器 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">状态信息</h2>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <strong>当前语言:</strong> {locale}
              </div>
              <div>
                <strong>已Hydrated:</strong> {isHydrated ? '✅' : '❌'}
              </div>
              <div>
                <strong>已初始化:</strong> {isInitialized ? '✅' : '❌'}
              </div>
            </div>
          </div>

          {/* 语言切换器 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">语言切换器</h2>
            <LanguageSwitcher />
          </div>

          {/* 翻译测试 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">翻译测试</h2>
            <div className="space-y-2">
              <div className="p-3 bg-gray-100 rounded">
                <strong>home.title:</strong> {t('home.title')}
              </div>
              <div className="p-3 bg-gray-100 rounded">
                <strong>home.subtitle:</strong> {t('home.subtitle')}
              </div>
              <div className="p-3 bg-gray-100 rounded">
                <strong>home.description:</strong> {t('home.description')}
              </div>
              <div className="p-3 bg-gray-100 rounded">
                <strong>nav.home:</strong> {t('nav.home')}
              </div>
              <div className="p-3 bg-gray-100 rounded">
                <strong>nav.create:</strong> {t('nav.create')}
              </div>
            </div>
          </div>

          {/* 实时状态监控 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">实时状态监控</h2>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm">
                请点击语言切换按钮，观察翻译是否立即更新。
                如果看到内容立即变化，说明新解决方案有效。
              </p>
            </div>
          </div>

          {/* 测试说明 */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">测试说明</h2>
            <ul className="text-sm space-y-1">
              <li>• 页面加载时应该没有hydration错误</li>
              <li>• 语言切换应该立即生效</li>
              <li>• 刷新页面后语言设置应该保持</li>
              <li>• 不应该出现内容闪烁</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}