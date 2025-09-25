import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AppError, ErrorCode, createErrorResponse, logError } from "@/lib/error-handler"
import { generateImage, checkGeminiAvailability, ImageGenerationRequest } from "@/lib/gemini"
import { Prisma } from "@prisma/client"

interface User {
  id: string
  email: string | null
  name?: string | null
  image?: string | null
  language?: string | null
  dailyUsage: Array<{
    date: Date
    count: number
  }>
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting image generation request')
    
    // 检查用户认证
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      )
    }

    let user: User | null = null

    console.log('Looking up user by ID:', session.user.id)
    // 获取用户信息 - 使用用户ID而不是email（支持Twitter用户）
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { dailyUsage: true }
    })

    if (!user) {
      console.log('User not found in database:', session.user.email)
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 400 }
      )
    } else {
      console.log('User found:', user.id)
    }

    // 检查今日使用次数
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayUsage = user.dailyUsage.find(usage => {
      const usageDate = new Date(usage.date)
      usageDate.setHours(0, 0, 0, 0)
      return usageDate.getTime() === today.getTime()
    })

    const currentUsageCount = todayUsage?.count || 0
    const dailyLimit = 100 // 每日限制100次

    if (currentUsageCount >= dailyLimit) {
      return NextResponse.json(
        { error: `今日生成次数已达上限（${dailyLimit}次），请明天再试` },
        { status: 429 }
      )
    }

    // 解析请求数据
    const formData = await request.formData()
    const imageFile = formData.get("image") as File
    const locationData = formData.get("location") as string

    if (!imageFile || !locationData) {
      return NextResponse.json(
        { error: "图片和位置信息是必需的" },
        { status: 400 }
      )
    }

    let location
    try {
      // 先检查locationData是否为空或无效
      if (!locationData || typeof locationData !== 'string') {
        console.log('Invalid location data type:', typeof locationData, locationData)
        return NextResponse.json(
          { error: "位置信息格式错误" },
          { status: 400 }
        )
      }

      // 尝试解析JSON，如果失败则提供更详细的错误信息
      location = JSON.parse(locationData)
      console.log('Parsed location:', location)
      
      // 验证必需的字段
      if (!location || typeof location !== 'object') {
        console.log('Location is not an object:', location)
        return NextResponse.json(
          { error: "位置信息格式错误" },
          { status: 400 }
        )
      }
      
      if (!location.lat || !location.lng || !location.address) {
        console.log('Missing required location fields:', {
          lat: location.lat,
          lng: location.lng,
          address: location.address
        })
        return NextResponse.json(
          { error: "位置信息缺少必需字段" },
          { status: 400 }
        )
      }
    } catch (error) {
      console.error('Failed to parse location data:', error)
      console.log('Raw location data:', locationData)
      return NextResponse.json(
        { error: "位置信息格式错误" },
        { status: 400 }
      )
    }

    // 检查Gemini API可用性
    const geminiAvailable = await checkGeminiAvailability()
    if (!geminiAvailable) {
      return NextResponse.json(
        { error: "AI服务暂时不可用，请稍后再试" },
        { status: 503 }
      )
    }

    // 将文件转换为base64
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // 构建基础提示词
    const basePrompt = `基于这张照片和位置信息（${location.address}），生成一个美丽的旅行场景图片。保持原有的构图和风格，但增强视觉效果，让它看起来更加吸引人和专业。`

    // 准备图像生成请求
    const imageRequest: ImageGenerationRequest = {
      inputImage: base64Image,
      inputImageMimeType: imageFile.type,
      prompt: basePrompt,
      location: location.address
    }

    // 使用Gemini API生成图像
    let generatedImageUrl: string
    let finalPrompt: string

    console.log('Using Gemini API to generate image')
    const result = await generateImage(imageRequest)
    
    if (result.success && result.imageData) {
      // 将base64图像数据转换为data URL
      generatedImageUrl = `data:image/png;base64,${result.imageData}`
      finalPrompt = basePrompt
      console.log('Image generated successfully with Gemini API')
    } else {
      console.error('Gemini API failed:', result.error)
      // 如果API调用失败，回退到模拟模式
      generatedImageUrl = `https://picsum.photos/800/800?random=${Date.now()}`
      finalPrompt = `图像生成失败，使用备用图片。错误：${result.error}`
    }

    // 保存生成记录到数据库
    let generatedImage = null
    if (user) {
      try {
        console.log('Starting database transaction for user:', user.id)
        // 使用事务确保数据一致性
        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          console.log('Creating generated image record...')
          // 创建生成记录
          const newImage = await tx.generatedImage.create({
            data: {
              userId: user!.id,
              imageUrl: generatedImageUrl,
              prompt: finalPrompt,
              location: location.address,
              locationLat: location.lat,
              locationLng: location.lng,
            }
          })

          console.log('Generated image created, now updating daily usage...')
          // 更新或创建今日使用记录
          await tx.dailyUsage.upsert({
            where: {
              userId_date: {
                userId: user!.id,
                date: today
              }
            },
            update: {
              count: {
                increment: 1
              }
            },
            create: {
              userId: user!.id,
              date: today,
              count: 1
            }
          })

          console.log('Daily usage updated successfully')
          return newImage
        })

        generatedImage = result
        console.log('Database transaction completed successfully')
      } catch (dbError) {
        console.error('Database transaction failed:', dbError)
        // 即使数据库操作失败，我们仍然返回生成的图像
        // 但会在日志中记录错误
        logError(dbError as Error, { 
          endpoint: '/api/generate',
          userId: user.id,
          operation: 'database_save'
        })
      }
    }

    // 返回成功响应
    return NextResponse.json({
      success: true,
      imageUrl: generatedImageUrl,
      prompt: finalPrompt,
      remainingUsage: dailyLimit - (todayUsage?.count || 0) - 1,
      generatedImage
    })

  } catch (error) {
    console.error("Generation API error:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace')
    console.error("Error message:", error instanceof Error ? error.message : String(error))
    console.error("Error type:", typeof error)
    console.error("Error constructor:", error?.constructor?.name)
    
    // 使用统一错误处理机制
    logError(error as Error, { 
      endpoint: '/api/generate'
    })

    if (error instanceof AppError) {
      const errorResponse = createErrorResponse(error, 'zh')
      return NextResponse.json(errorResponse, { status: error.statusCode })
    }

    // 处理特定类型的错误
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('Prisma')) {
        const dbError = new AppError(ErrorCode.DATABASE_ERROR, error.message, 503)
        const errorResponse = createErrorResponse(dbError, 'zh')
        return NextResponse.json(errorResponse, { status: 503 })
      }
      
      if (error.message.includes('FormData') || error.message.includes('File')) {
        const fileError = new AppError(ErrorCode.INVALID_IMAGE_FORMAT, error.message, 400)
        const errorResponse = createErrorResponse(fileError, 'zh')
        return NextResponse.json(errorResponse, { status: 400 })
      }
    }
    
    // 默认服务器错误
    const defaultError = new AppError(ErrorCode.INTERNAL_SERVER_ERROR, 'Unexpected error', 500)
    const errorResponse = createErrorResponse(defaultError, 'zh')
    return NextResponse.json(errorResponse, { status: 500 })
  }
}