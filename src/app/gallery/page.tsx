"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Camera, Download, Share2, Trash2, ArrowLeft, Plus, MapPin } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { UserAvatar } from "@/components/ui/user-avatar"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import { useTranslation } from "@/hooks/use-translation"

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
  const { t } = useTranslation()
  
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const { showConfirm, ConfirmDialog } = useConfirmDialog()

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
    return <Loading text={t('gallery.loading')} />
  }

  if (status === "unauthenticated") {
    return <Loading text={t('gallery.redirecting')} />
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
          title: t('gallery.shareTitle'),
          text: `${t('gallery.shareText')} ${image.location}`,
          url: `${window.location.origin}/gallery/${image.id}`,
        })
      } catch (error) {
        console.error("Share error:", error)
      }
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(`${window.location.origin}/gallery/${image.id}`)
      alert(t('gallery.linkCopied'))
    }
  }

  const handleDelete = async (image: GeneratedImage) => {
    showConfirm({
      title: t('gallery.deleteTitle'),
      message: t('gallery.deleteMessage'),
      confirmText: t('gallery.deleteConfirm'),
      cancelText: t('gallery.deleteCancel'),
      variant: "destructive",
      onConfirm: async () => {
        setIsDeleting(image.id)
        try {
          console.log(`[FRONTEND] Starting deletion for image: ${image.id}`)
          
          const response = await fetch(`/api/gallery/${image.id}`, {
            method: "DELETE",
          })

          const data = await response.json()
          console.log(`[FRONTEND] Delete response:`, data)

          if (response.ok) {
            // 成功删除
            setImages(images.filter(img => img.id !== image.id))
            setSelectedImage(null)
            console.log(`[FRONTEND] Image ${image.id} deleted successfully`)
            
            // 显示成功消息
            if (data.message) {
              // 可以添加一个成功提示组件，这里暂时用console.log
              console.log(`[FRONTEND] Success: ${data.message}`)
            }
          } else {
            // 处理不同的错误状态
            let errorMessage = t('gallery.deleteFailed')
            
            if (response.status === 401) {
              errorMessage = t('gallery.deleteLoginRequired')
            } else if (response.status === 404) {
              errorMessage = data.error || t('gallery.imageNotFound')
            } else if (response.status === 500) {
              errorMessage = data.error || t('error.serverError')
            } else if (data.error) {
              errorMessage = data.error
            }
            
            console.error(`[FRONTEND] Delete failed with status ${response.status}:`, data)
            alert(errorMessage)
          }
        } catch (error) {
          console.error(`[FRONTEND] Delete error for image ${image.id}:`, error)
          
          // 网络错误或其他异常
          let errorMessage = t('gallery.deleteNetworkError')
          if (error instanceof Error) {
            errorMessage = `${t('gallery.deleteFailed')}: ${error.message}`
          }
          
          alert(errorMessage)
        } finally {
          setIsDeleting(null)
        }
      }
    })
  }

  if (isLoading) {
    return <Loading text={t('gallery.loadingGallery')} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm">{t('gallery.backToHome')}</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Camera className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">{t('gallery.myGallery')}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/create">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t('gallery.newCreation')}
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
              <h2 className="text-2xl font-semibold mb-4">{t('gallery.noWorks')}</h2>
              <p className="text-muted-foreground mb-8">
                {t('gallery.startFirstCreation')}
              </p>
              <Link href="/create">
                <Button size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  {t('gallery.startCreating')}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* 图片网格 */
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">{t('gallery.myAIWorks')}</h1>
                <p className="text-muted-foreground mt-2">
                  {t('gallery.totalWorks')} {images.length} {t('gallery.worksUnit')}
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
                      alt={`${t('gallery.aiGeneratedImage')} - ${image.location}`}
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
                        title={t('gallery.download')}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleShare(image)
                        }}
                        className="p-2 bg-background/80 hover:bg-background rounded-full"
                        title={t('gallery.share')}
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
                        title={t('gallery.delete')}
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
                  alt={`${t('gallery.aiGeneratedImage')} - ${selectedImage.location}`}
                  className="w-full h-auto"
                />
              </div>

              {/* 详情 */}
              <div className="lg:w-1/3 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{t('gallery.workDetails')}</h3>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="p-1 hover:bg-accent rounded"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t('gallery.location')}</label>
                    <p className="text-sm">{selectedImage.location}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t('gallery.creationTime')}</label>
                    <p className="text-sm">{new Date(selectedImage.createdAt).toLocaleString()}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t('gallery.aiPrompt')}</label>
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
                      {t('gallery.download')}
                    </Button>
                    <Button
                      onClick={() => handleShare(selectedImage)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      {t('gallery.share')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 确认对话框 */}
      <ConfirmDialog />
    </div>
  )
}