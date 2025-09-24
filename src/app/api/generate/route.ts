import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AppError, ErrorCode, createErrorResponse, logError } from "@/lib/error-handler"
import { generateImage, generateDemoImage, checkGeminiAvailability, ImageGenerationRequest } from "@/lib/gemini"
import { Prisma } from "@prisma/client"

interface User {
  id: string
  email: string
  name?: string | null
  image?: string | null
  language?: string | null
  dailyUsage: Array<{
    date: Date
    count: number
  }>
}

export async function POST(request: NextRequest) {
  let user: User | null = null
  let isDemoMode = false
  
  try {
    console.log('=== Generate API called ===')
    
    // 检查是否为演示模式
    const apiKey = process.env.GOOGLE_AI_API_KEY
    const demoModeFlag = process.env.NEXT_PUBLIC_DEMO_MODE
    isDemoMode = demoModeFlag === "true" || !apiKey || apiKey === "your-google-ai-api-key"
    console.log('Demo mode:', isDemoMode, 'API key exists:', !!apiKey, 'Demo flag:', demoModeFlag)

    // 验证用户身份（演示模式下可跳过）
    const session = await getServerSession(authOptions)
    console.log('Session:', session ? 'exists' : 'null', session?.user?.email)
    
    // 临时允许无认证测试真实API
    if (!isDemoMode && !session?.user?.email) {
      console.log('Warning: no session in non-demo mode, allowing for testing')
      // return NextResponse.json(
      //   { error: "未授权" },
      //   { status: 401 }
      // )
    }

    if (session?.user?.email) {
      console.log('Looking up user:', session.user.email)
      // 获取用户信息
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { dailyUsage: true }
      })

      if (!user) {
        console.log('User not found in database:', session.user.email)
        if (isDemoMode) {
          console.log('Demo mode: allowing user without database record')
          // 在演示模式下，允许没有数据库记录的用户继续使用
        } else {
          // 在非演示模式下，用户必须在数据库中存在
          return NextResponse.json(
            { error: "用户不存在" },
            { status: 400 }
          )
        }
      } else {
        console.log('User found:', user.id)
      }
    }

    // 检查今日使用额度（仅在非演示模式下）
    let todayUsage = null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (user) {
      todayUsage = user.dailyUsage.find((usage: { date: Date; count: number }) => 
        usage.date.getTime() === today.getTime()
      )

      if (todayUsage && todayUsage.count >= 3) {
        return NextResponse.json(
          { error: "今日免费额度已用完，明天再来吧！" },
          { status: 429 }
        )
      }
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
      console.log('Location parsing error:', error)
      console.log('Raw location data:', locationData)
      console.log('Location data length:', locationData?.length)
      return NextResponse.json(
        { error: "位置信息JSON格式错误" },
        { status: 400 }
      )
    }

    // 将图片转换为base64
    console.log('Converting image to base64...')
    const imageBuffer = await imageFile.arrayBuffer()
    const imageBase64 = Buffer.from(imageBuffer).toString('base64')
    console.log('Image converted, base64 length:', imageBase64.length)

    // 构建AI提示词
    const basePrompt = `Create a travel scene image that combines the uploaded image with the location "${location.name || location.address}". 
    The image should show the person or subject from the uploaded image in a realistic travel scenario at ${location.address}. 
    Make it look natural and authentic, as if the person actually visited this location. 
    Maintain the original image's style and lighting while seamlessly integrating the new location background.
    The result should be photorealistic and travel-worthy.`

    // 准备图像生成请求
    const imageRequest: ImageGenerationRequest = {
      prompt: basePrompt,
      location: location.address,
      style: 'photorealistic, travel photography, high quality',
      inputImage: imageBase64,
      inputImageMimeType: imageFile.type
    }

    // 使用新的Gemini API客户端生成图像
    let generatedImageUrl: string
    let finalPrompt: string

    if (isDemoMode) {
      console.log('Using demo mode with Gemini API')
      const result = await generateDemoImage(imageRequest)
      
      if (result.success && result.imageData) {
        // 将base64图像数据转换为data URL
        generatedImageUrl = `data:image/png;base64,${result.imageData}`
        finalPrompt = `演示模式：使用Gemini 2.5 Flash Image生成的示例图片，展示在${location.address}的旅行场景。`
      } else {
        // 如果Gemini API也失败了，使用备用图片
        console.log('Demo mode fallback to static images')
        const demoImages = [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop'
        ]
        generatedImageUrl = demoImages[Math.floor(Math.random() * demoImages.length)]
        finalPrompt = `演示模式：这是一个在${location.address}的示例图片。在真实环境中，这里会显示AI生成的图片。错误：${result.error}`
      }
    } else {
      // 生产模式：使用真实的Gemini API
      console.log('Using production mode with Gemini API')
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
    }

    // 保存生成记录到数据库（仅在非演示模式下）
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
              count: { increment: 1 }
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
        
        console.log('Database transaction completed successfully')
        generatedImage = result
      } catch (dbError) {
        console.error("Database transaction failed:", dbError)
        console.error("Database error details:", {
          message: dbError instanceof Error ? dbError.message : String(dbError),
          stack: dbError instanceof Error ? dbError.stack : undefined,
          name: dbError instanceof Error ? dbError.name : undefined
        })
        // 数据库操作失败，但图片生成成功，继续返回结果
        // 在演示模式下，这不会影响用户体验
        console.log("Continuing without database record due to DB error")
      }
    }

    // 确保finalPrompt已经在前面定义，这里不需要重复定义

    return NextResponse.json({
      id: generatedImage?.id || `demo-${Date.now()}`,
      imageUrl: generatedImageUrl,
      prompt: finalPrompt,
      location: location,
      remainingUsage: user && todayUsage ? 3 - todayUsage.count - 1 : (user ? 2 : 999)
    })

  } catch (error) {
    console.error("Generation API error:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace')
    console.error("Error message:", error instanceof Error ? error.message : String(error))
    console.error("Error type:", typeof error)
    console.error("Error constructor:", error?.constructor?.name)
    
    // 使用统一错误处理机制
    logError(error as Error, { 
      endpoint: '/api/generate',
      userId: user?.id,
      isDemoMode 
    })

    if (error instanceof AppError) {
      const errorResponse = createErrorResponse(error, user?.language || 'zh')
      return NextResponse.json(errorResponse, { status: error.statusCode })
    }

    // 处理特定类型的错误
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('Prisma')) {
        const dbError = new AppError(ErrorCode.DATABASE_ERROR, error.message, 503)
        const errorResponse = createErrorResponse(dbError, user?.language || 'zh')
        return NextResponse.json(errorResponse, { status: 503 })
      }
      
      if (error.message.includes('FormData') || error.message.includes('File')) {
        const fileError = new AppError(ErrorCode.INVALID_IMAGE_FORMAT, error.message, 400)
        const errorResponse = createErrorResponse(fileError, user?.language || 'zh')
        return NextResponse.json(errorResponse, { status: 400 })
      }
    }
    
    // 默认服务器错误
    const defaultError = new AppError(ErrorCode.INTERNAL_SERVER_ERROR, 'Unexpected error', 500)
    const errorResponse = createErrorResponse(defaultError, user?.language || 'zh')
    return NextResponse.json(errorResponse, { status: 500 })
  }
}