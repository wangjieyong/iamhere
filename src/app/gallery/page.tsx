"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Camera, Download, Share2, Trash2, ArrowLeft, Plus, MapPin } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { UserAvatar } from "@/components/ui/user-avatar"

interface GeneratedImage {
  id: string
  imageUrl: string
  prompt: string
  location: string
  locationLat: number
  locationLng: number
  createdAt: string
}

export default function GalleryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // 处理认证状态
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  // 获取用户图片
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("/api/gallery")
        if (response.ok) {
          const data = await response.json()
          setImages(data.images)
        }
      } catch (error) {
        console.error("Failed to fetch images:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchImages()
    }
  }, [session])

  // 如果未登录，显示加载状态
  if (status === "loading") {
    return <Loading text="正在加载..." />
  }

  if (status === "unauthenticated") {
    return <Loading text="正在跳转到登录页面..." />
  }

  const handleDownload = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `iamhere-${image.id}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download error:", error)
    }
  }

  const handleShare = async (image: GeneratedImage) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "我的AI旅行图片",
          text: `在${image.location}的AI旅行体验`,
          url: `${window.location.origin}/gallery/${image.id}`,
        })
      } catch (error) {
        console.error("Share error:", error)
      }
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(`${window.location.origin}/gallery/${image.id}`)
      alert("链接已复制到剪贴板")
    }
  }

  const handleDelete = async (image: GeneratedImage) => {
    if (!confirm("确定要删除这张图片吗？此操作无法撤销。")) {
      return
    }

    setIsDeleting(image.id)
    try {
      const response = await fetch(`/api/gallery/${image.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setImages(images.filter(img => img.id !== image.id))
        setSelectedImage(null)
      } else {
        alert("删除失败，请稍后重试")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("删除失败，请稍后重试")
    } finally {
      setIsDeleting(null)
    }
  }

  if (isLoading) {
    return <Loading text="正在加载图库..." />
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
              <span className="font-semibold text-lg">我的图库</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/create">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                新建创作
              </Button>
            </Link>
            <UserAvatar />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {images.length === 0 ? (
          /* 空状态 */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="p-6 bg-accent/50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Camera className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-4">还没有创作作品</h2>
              <p className="text-muted-foreground mb-8">
                开始你的第一次AI旅行创作，生成独特的旅行场景图片
              </p>
              <Link href="/create">
                <Button size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  开始创作
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* 图片网格 */
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">我的AI旅行作品</h1>
                <p className="text-muted-foreground mt-2">
                  共 {images.length} 张作品
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-200"
                >
                  {/* 图片 */}
                  <div 
                    className="aspect-square bg-accent cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image.imageUrl}
                      alt={`AI生成图片 - ${image.location}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  {/* 信息 */}
                  <div className="p-4">
                    <div className="flex items-start space-x-2 mb-3">
                      <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-medium truncate">
                        {image.location}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(image.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* 操作按钮 */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(image)
                        }}
                        className="p-2 bg-background/80 hover:bg-background rounded-full"
                        title="下载"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleShare(image)
                        }}
                        className="p-2 bg-background/80 hover:bg-background rounded-full"
                        title="分享"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(image)
                        }}
                        disabled={isDeleting === image.id}
                        className="p-2 bg-background/80 hover:bg-background rounded-full text-destructive"
                        title="删除"
                      >
                        {isDeleting === image.id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 图片详情模态框 */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="max-w-4xl w-full bg-background rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col lg:flex-row">
              {/* 图片 */}
              <div className="lg:w-2/3">
                <img
                  src={selectedImage.imageUrl}
                  alt={`AI生成图片 - ${selectedImage.location}`}
                  className="w-full h-auto"
                />
              </div>

              {/* 详情 */}
              <div className="lg:w-1/3 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">作品详情</h3>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="p-1 hover:bg-accent rounded"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">地点</label>
                    <p className="text-sm">{selectedImage.location}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">创作时间</label>
                    <p className="text-sm">{new Date(selectedImage.createdAt).toLocaleString()}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">AI提示词</label>
                    <p className="text-sm text-muted-foreground">{selectedImage.prompt}</p>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button
                      onClick={() => handleDownload(selectedImage)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      下载
                    </Button>
                    <Button
                      onClick={() => handleShare(selectedImage)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      分享
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}