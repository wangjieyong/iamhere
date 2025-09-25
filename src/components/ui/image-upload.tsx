"use client"

import { useState, useCallback, useRef } from "react"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { Button } from "./button"
import { validateImageFile } from "@/lib/utils"
import { FILE_LIMITS } from "@/lib/constants"
import { t } from "@/lib/i18n"

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  selectedImage?: File
  onImageRemove?: () => void
  maxSize?: number // in MB
  accept?: string
}

export function ImageUpload({ 
  onImageSelect, 
  selectedImage, 
  onImageRemove,
  maxSize = FILE_LIMITS.MAX_IMAGE_SIZE_MB,
  accept = "image/*"
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string>("")
  const [preview, setPreview] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理文件选择
  const handleFileSelect = useCallback((file: File) => {
    setError("")
    
    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      setError(`${t('upload.fileSizeError')} ${maxSize}MB`)
      return
    }
    
    const validation = validateImageFile(file)
    if (!validation.isValid) {
      setError(validation.error || t('upload.validationFailed'))
      return
    }

    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    onImageSelect(file)
  }, [maxSize, onImageSelect])

  // 处理拖拽
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  // 处理文件输入
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  // 移除图片
  const handleRemove = useCallback(() => {
    setPreview("")
    setError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onImageRemove?.()
  }, [onImageRemove])

  // 打开文件选择器
  const openFileSelector = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className="space-y-4 h-[400px] flex flex-col">
      <div className="space-y-2 flex-shrink-0">
        <label className="text-sm font-medium">{t('upload.title')}</label>
        <p className="text-xs text-muted-foreground">
          {t('upload.description')}
        </p>
      </div>

      {/* 上传区域 */}
      {!selectedImage && !preview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileSelector}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors flex-1 flex items-center justify-center
            ${isDragging 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50 hover:bg-accent/50"
            }
          `}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-accent rounded-full">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {isDragging ? t('upload.dropToUpload') : t('upload.dragDrop')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('upload.supportedFormats')} {maxSize}MB
              </p>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      ) : (
        /* 预览区域 */
        <div className="space-y-3 flex-1 flex flex-col">
          {/* 固定大小的预览框 */}
          <div className="relative group">
            <div className="relative w-full h-48 bg-accent rounded-lg overflow-hidden">
              {preview ? (
                <img
                  src={preview}
                  alt={t('upload.previewImage')}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              
              {/* 移除按钮 */}
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1 bg-background/80 hover:bg-background rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 重新选择按钮 */}
          <Button
            variant="outline"
            size="sm"
            onClick={openFileSelector}
            className="w-full"
          >
            {t('upload.selectAgain')}
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}

      {/* 错误信息 */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}


    </div>
  )
}