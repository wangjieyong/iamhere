"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Camera, Sparkles, Download, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loading, LoadingOverlay } from "@/components/ui/loading"
import { ImageUpload } from "@/components/ui/image-upload"
import { MapSelector } from "@/components/ui/map-selector"
import { UserAvatar } from "@/components/ui/user-avatar"
import { useTranslation } from "@/hooks/use-translation"

interface Location {
  lat: number
  lng: number
  address: string
  name?: string
}

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  location: Location
  originalImage?: string
  createdAt: Date
}

export default function CreatePage() {
  const { status } = useSession()
  const router = useRouter()
  const { t } = useTranslation()
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null)
  const [error, setError] = useState<string>("")

  // 处理认证状态
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  // 如果未登录，显示加载状态
  if (status === "loading") {
    return <Loading text={t('create.loading')} />
  }

  if (status === "unauthenticated") {
    return <Loading text={t('create.redirecting')} />
  }

  const handleImageSelect = (file: File) => {
    setSelectedImage(file)
    setError("")
  }

  const handleImageRemove = () => {
    setSelectedImage(null)
  }

  const handleLocationSelect = (location: Location | null) => {
    setSelectedLocation(location)
    setError("")
  }

  const handleGenerate = async () => {
    if (!selectedImage || !selectedLocation) {
      setError(t('create.uploadAndSelect'))
      return
    }

    setIsGenerating(true)
    setError("")

    try {
      // 验证selectedImage是否为有效的File对象
      if (!(selectedImage instanceof File)) {
        throw new Error(t('create.invalidFormat'))
      }

      // 创建 FormData 用于文件上传
      const formData = new FormData()
      formData.append("image", selectedImage)
      formData.append("location", JSON.stringify(selectedLocation))

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(t('create.loginRequired'))
        } else if (response.status === 429) {
          throw new Error(t('create.dailyLimitReached'))
        } else if (response.status === 400) {
          const errorData = await response.json()
          throw new Error(errorData.error || t('error.invalidImage'))
        } else if (response.status === 503) {
          const errorData = await response.json()
          throw new Error(errorData.error || t('error.serverError'))
        } else {
          // 尝试获取服务器返回的具体错误信息
          try {
            const errorData = await response.json()
            throw new Error(errorData.error || t('error.unknownError'))
          } catch {
            throw new Error(t('error.unknownError'))
          }
        }
      }

      const result = await response.json()
      
      setGeneratedImage({
        id: result.id,
        url: result.imageUrl,
        prompt: result.prompt,
        location: selectedLocation,
        originalImage: URL.createObjectURL(selectedImage),
        createdAt: new Date(),
      })

    } catch (error) {
      console.error("Generation error:", error)
      setError(error instanceof Error ? error.message : t('error.unknownError'))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!generatedImage) return

    try {
      const response = await fetch(generatedImage.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `iamhere-${generatedImage.location.name}-${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download error:", error)
      setError(t('create.downloadFailed'))
    }
  }



  const handleCreateNew = () => {
    setSelectedImage(null)
    setSelectedLocation(null)
    setGeneratedImage(null)
    setError("")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm">{t('create.backToHome')}</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Camera className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">{t('create.workshop')}</span>
            </div>
          </div>
          <UserAvatar />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* 主标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('create.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('create.subtitle')}
          </p>
        </div>

        {!generatedImage ? (
          /* 创作界面 */
          <LoadingOverlay isLoading={isGenerating}>
            <div className="max-w-4xl mx-auto">

              <div className="grid lg:grid-cols-2 gap-8">
                {/* 左侧：图片上传 */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      {t('create.step1')}
                    </h2>
                    <ImageUpload
                       onImageSelect={setSelectedImage}
                       selectedImage={selectedImage || undefined}
                     />
                  </div>
                </div>

                {/* 右侧：地点选择 */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      {t('create.step2')}
                    </h2>
                    <MapSelector
                       onLocationSelect={setSelectedLocation}
                       selectedLocation={selectedLocation || undefined}
                     />
                  </div>
                </div>
              </div>

              {/* 错误信息 */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              {/* 生成按钮 */}
              <div className="mt-8 text-center">
                <Button
                  onClick={handleGenerate}
                  disabled={!selectedImage || !selectedLocation || isGenerating}
                  size="lg"
                  className="px-8 py-3 text-lg"
                >
                  {isGenerating ? (
                    <>
                      <Loading className="mr-2" />
                      {t('create.generating')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 w-5 h-5" />
                      {t('create.startGenerate')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </LoadingOverlay>
        ) : (
          /* 结果展示界面 */
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">{t('create.resultTitle')}</h1>
              <p className="text-muted-foreground">
                {t('create.location')}: {generatedImage.location.name || generatedImage.location.address}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* 原图 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('create.originalImage')}</h3>
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={generatedImage.originalImage}
                    alt={t('create.originalImage')}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* 生成图 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('create.generatedImage')}</h3>
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={generatedImage.url}
                    alt={t('create.generatedImage')}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleDownload}
                size="lg"
                className="px-8"
              >
                <Download className="mr-2 w-5 h-5" />
                {t('create.downloadImage')}
              </Button>
              <Button
                onClick={() => {
                  setGeneratedImage(null)
                  setSelectedImage(null)
                  setSelectedLocation(null)
                  setError("")
                }}
                variant="outline"
                size="lg"
                className="px-8"
              >
                {t('create.createAgain')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}