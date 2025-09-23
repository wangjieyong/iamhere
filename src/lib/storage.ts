import { v4 as uuidv4 } from 'uuid'
import { promises as fs } from 'fs'
import path from 'path'

// 存储配置接口
export interface StorageConfig {
  provider: 'local' | 'cloudinary' | 's3'
  cloudinary?: {
    cloudName: string
    apiKey: string
    apiSecret: string
  }
  s3?: {
    accessKeyId: string
    secretAccessKey: string
    region: string
    bucket: string
  }
}

// 获取存储配置
export function getStorageConfig(): StorageConfig {
  const provider = process.env.STORAGE_PROVIDER as 'local' | 'cloudinary' | 's3' || 'local'
  
  const config: StorageConfig = { provider }
  
  if (provider === 'cloudinary') {
    config.cloudinary = {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
      apiKey: process.env.CLOUDINARY_API_KEY!,
      apiSecret: process.env.CLOUDINARY_API_SECRET!
    }
  } else if (provider === 's3') {
    config.s3 = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      region: process.env.AWS_REGION!,
      bucket: process.env.AWS_S3_BUCKET!
    }
  }
  
  return config
}

// 云存储上传函数（占位符）
async function uploadToCloudinary(
  imageBuffer: Buffer,
  fileName: string,
  config: NonNullable<StorageConfig['cloudinary']>
): Promise<string> {
  // 在生产环境中，这里会实现真正的Cloudinary上传
  // 目前返回本地存储路径作为占位符
  console.log('Cloudinary upload placeholder - using local storage instead', config.cloudName)
  return uploadToLocal(imageBuffer, fileName)
}

async function uploadToS3(
  imageBuffer: Buffer,
  fileName: string,
  mimeType: string,
  config: NonNullable<StorageConfig['s3']>
): Promise<string> {
  // 在生产环境中，这里会实现真正的S3上传
  // 目前返回本地存储路径作为占位符
  console.log('S3 upload placeholder - using local storage instead', mimeType, config.bucket)
  return uploadToLocal(imageBuffer, fileName)
}

// 上传图片
export async function uploadImage(
  imageBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const config = getStorageConfig()
  const uniqueFileName = `${uuidv4()}-${fileName}`
  
  switch (config.provider) {
    case 'cloudinary':
      if (!config.cloudinary) throw new Error('Cloudinary configuration missing')
      return uploadToCloudinary(imageBuffer, uniqueFileName, config.cloudinary)
    
    case 's3':
      if (!config.s3) throw new Error('S3 configuration missing')
      return uploadToS3(imageBuffer, uniqueFileName, mimeType, config.s3)
    
    case 'local':
    default:
      return uploadToLocal(imageBuffer, uniqueFileName)
  }
}

// 本地存储
async function uploadToLocal(
  imageBuffer: Buffer,
  fileName: string
): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  
  // 确保上传目录存在
  try {
    await fs.access(uploadDir)
  } catch {
    await fs.mkdir(uploadDir, { recursive: true })
  }
  
  const filePath = path.join(uploadDir, fileName)
  await fs.writeFile(filePath, imageBuffer)
  
  return `/uploads/${fileName}`
}

// 删除图片
export async function deleteImage(imageUrl: string): Promise<void> {
  await deleteFromLocal(imageUrl)
}

// 从本地删除
async function deleteFromLocal(imageUrl: string): Promise<void> {
  const fileName = imageUrl.split('/').pop()
  if (fileName) {
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName)
    try {
      await fs.unlink(filePath)
    } catch (error) {
      // 文件可能已经不存在，忽略错误
      console.warn('Failed to delete local file:', error)
    }
  }
}