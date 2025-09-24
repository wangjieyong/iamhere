"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Camera, Sparkles, Download, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { ImageUpload } from "@/components/ui/image-upload"
import { MapSelector } from "@/components/ui/map-selector"
import { UserAvatar } from "@/components/ui/user-avatar"

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
    return <Loading text="正在加载..." />
  }

  if (status === "unauthenticated") {
    return <Loading text="正在跳转到登录页面..." />
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
      setError("请上传图片并选择地理位置")
      return
    }

    setIsGenerating(true)
    setError("")

    try {
      // 验证selectedImage是否为有效的File对象
      if (!(selectedImage instanceof File)) {
        throw new Error("选择的图片格式无效，请重新上传")
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
          throw new Error("请先登录后再使用图片生成功能")
        } else if (response.status === 429) {
          throw new Error("今日使用次数已达上限，请明天再试")
        } else if (response.status === 400) {
          const errorData = await response.json()
          throw new Error(errorData.error || "请求参数错误")
        } else if (response.status === 503) {
          const errorData = await response.json()
          throw new Error(errorData.error || "服务暂时不可用，请稍后重试")
        } else {
          // 尝试获取服务器返回的具体错误信息
          try {
            const errorData = await response.json()
            throw new Error(errorData.error || "生成失败，请稍后重试")
          } catch {
            throw new Error("生成失败，请稍后重试")
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
      setError(error instanceof Error ? error.message : "生成失败，请稍后重试")
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
      a.download = `iamhere-${generatedImage.id}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download error:", error)
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
              <span className="text-sm">返回首页</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Camera className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">AI创作工坊</span>
            </div>
          </div>
          <UserAvatar />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!generatedImage ? (
          /* 创作界面 */
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">创造你的AI旅行体验</h1>
              <p className="text-muted-foreground">
                上传一张图片，选择地理位置，让AI为你生成独特的旅行场景
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* 左侧：图片上传 */}
              <div className="space-y-6">
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  selectedImage={selectedImage || undefined}
                  onImageRemove={handleImageRemove}
                />
              </div>

              {/* 右侧：地图选择 */}
              <div className="space-y-6">
                <MapSelector
                  onLocationSelect={handleLocationSelect}
                  selectedLocation={selectedLocation || undefined}
                />
              </div>
            </div>

            {/* 错误信息 */}
            {error && (
              <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* 生成按钮 */}
            <div className="mt-8 text-center">
              <Button
                onClick={handleGenerate}
                disabled={!selectedImage || !selectedLocation || isGenerating}
                size="lg"
                className="px-8"
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>AI正在创作中...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5" />
                    <span>开始AI创作</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* 结果展示界面 */
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">你的AI旅行作品</h1>
              <p className="text-muted-foreground">
                基于 {generatedImage.location.name || generatedImage.location.address} 生成
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* 原图 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">原始图片</h3>
                <div className="aspect-square bg-accent rounded-lg overflow-hidden">
                  {generatedImage.originalImage && (
                    <img
                      src={generatedImage.originalImage}
                      alt="原始图片"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>

              {/* 生成图 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">AI生成图片</h3>
                <div className="aspect-square bg-accent rounded-lg overflow-hidden">
                  <img
                    src={generatedImage.url}
                    alt="AI生成图片"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleDownload} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                下载图片
              </Button>
              <Button onClick={handleCreateNew}>
                <Sparkles className="h-4 w-4 mr-2" />
                创作新作品
              </Button>
            </div>


          </div>
        )}
      </div>
    </div>
  )
}