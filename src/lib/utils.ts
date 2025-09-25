import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { FILE_LIMITS } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  if (!FILE_LIMITS.ALLOWED_IMAGE_FORMATS.includes(file.type as any)) {
    return {
      isValid: false,
      error: 'Only JPG, PNG, WebP, and HEIC files are supported'
    }
  }
  
  if (file.size > FILE_LIMITS.MAX_IMAGE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size must be less than ${formatFileSize(FILE_LIMITS.MAX_IMAGE_SIZE_BYTES)}`
    }
  }
  
  return { isValid: true }
}