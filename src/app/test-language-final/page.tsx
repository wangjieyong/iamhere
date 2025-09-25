'use client'

import { useTranslation } from '@/hooks/use-translation'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { useState, useEffect } from 'react'

export default function TestLanguageFinalPage() {
  const { t, locale, isHydrated } = useTranslation()
  const [renderCount, setRenderCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && isHydrated) {
      setRenderCount(prev => prev + 1)
    }
  }, [locale, mounted, isHydrated])

  // 在水合完成之前显示加载状态
  if (!mounted || !isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">正在加载语言设置...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Language Switcher */}
        <div className="flex justify-between items-center mb-8 p-4 bg-white rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-800">
            语言切换功能测试 / Language Switch Test
          </h1>
          <LanguageSwitcher />
        </div>

        {/* Debug Information */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">调试信息 / Debug Info</h2>
          <div className="space-y-2 text-sm">
            <p><strong>当前语言 / Current Locale:</strong> <span className="font-mono bg-gray-200 px-2 py-1 rounded">{locale}</span></p>
            <p><strong>渲染次数 / Render Count:</strong> <span className="font-mono bg-gray-200 px-2 py-1 rounded">{renderCount}</span></p>
          </div>
        </div>

        {/* Translation Tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Navigation Translations */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">导航翻译 / Navigation Translations</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">nav.home:</span>
                <span className="font-medium">{t('nav.home')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">nav.create:</span>
                <span className="font-medium">{t('nav.create')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">nav.gallery:</span>
                <span className="font-medium">{t('nav.gallery')}</span>
              </div>
            </div>
          </div>

          {/* Page Content Translations */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">页面内容翻译 / Page Content Translations</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">home.title:</span>
                <span className="font-medium">{t('home.title')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">home.subtitle:</span>
                <span className="font-medium">{t('home.subtitle')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">create.title:</span>
                <span className="font-medium">{t('create.title')}</span>
              </div>
            </div>
          </div>

          {/* Gallery Translations */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">图库翻译 / Gallery Translations</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">gallery.title:</span>
                <span className="font-medium">{t('gallery.title')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">gallery.empty:</span>
                <span className="font-medium">{t('gallery.empty')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">gallery.loading:</span>
                <span className="font-medium">{t('gallery.loading')}</span>
              </div>
            </div>
          </div>

          {/* Button Translations */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">按钮翻译 / Button Translations</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">common.generate:</span>
                <span className="font-medium">{t('common.generate')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">common.download:</span>
                <span className="font-medium">{t('common.download')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">common.share:</span>
                <span className="font-medium">{t('common.share')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expected Results */}
        <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
          <h2 className="text-lg font-semibold text-green-800 mb-2">预期结果 / Expected Results</h2>
          <div className="text-sm text-green-700 space-y-1">
            <p>✅ 点击语言切换按钮应该立即改变所有翻译文本</p>
            <p>✅ 英文状态下按钮显示"中文"，中文状态下按钮显示"EN"</p>
            <p>✅ 渲染次数应该在语言切换时增加</p>
            <p>✅ 所有翻译键都应该显示对应语言的正确文本</p>
            <p>✅ 页面刷新后应该保持选择的语言</p>
          </div>
        </div>

        {/* Test Instructions */}
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">测试说明 / Test Instructions</h2>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>1. 点击右上角的语言切换按钮</p>
            <p>2. 观察所有翻译文本是否立即改变</p>
            <p>3. 检查渲染次数是否增加</p>
            <p>4. 刷新页面，检查语言设置是否保持</p>
            <p>5. 重复切换几次，确保功能稳定</p>
          </div>
        </div>
      </div>
    </div>
  )
}