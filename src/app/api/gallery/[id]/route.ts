import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { deleteImage } from "@/lib/storage"
import { AppError, ErrorCode, createErrorResponse, logError } from "@/lib/error-handler"
import { Prisma } from "@prisma/client"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const imageId = params.id
  console.log(`[DELETE IMAGE] Starting deletion for image ID: ${imageId}`)

  try {
    // 验证用户身份
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log(`[DELETE IMAGE] Unauthorized access attempt for image ID: ${imageId}`)
      const error = new AppError(ErrorCode.UNAUTHORIZED, 'Unauthorized access', 401)
      const errorResponse = createErrorResponse(error, 'zh')
      return NextResponse.json(errorResponse, { status: 401 })
    }

    console.log(`[DELETE IMAGE] User authenticated:`, {
      id: session.user.id,
      name: session.user.name
    })

    // 获取用户信息 - 优先通过ID查找
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      console.log(`[DELETE IMAGE] User not found for ID: ${session.user.id}`)
      const error = new AppError(ErrorCode.UNAUTHORIZED, 'User not found', 404)
      const errorResponse = createErrorResponse(error, 'zh')
      return NextResponse.json(errorResponse, { status: 404 })
    }

    console.log(`[DELETE IMAGE] User found: ${user.id}`)

    // 检查图片是否存在且属于当前用户
    const image = await prisma.generatedImage.findFirst({
      where: {
        id: imageId,
        userId: user.id
      }
    })

    if (!image) {
      console.log(`[DELETE IMAGE] Image not found or not owned by user. Image ID: ${imageId}, User ID: ${user.id}`)
      const error = new AppError(ErrorCode.FORBIDDEN, 'Image not found or permission denied', 404)
      const errorResponse = createErrorResponse(error, 'zh')
      return NextResponse.json(errorResponse, { status: 404 })
    }

    console.log(`[DELETE IMAGE] Image found: ${image.imageUrl}`)

    // 使用事务确保数据一致性
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 删除数据库记录
      await tx.generatedImage.delete({
        where: { id: imageId }
      })
      console.log(`[DELETE IMAGE] Database record deleted for image ID: ${imageId}`)

      // 删除物理文件（如果是本地存储）
      try {
        if (image.imageUrl && !image.imageUrl.startsWith('data:') && !image.imageUrl.startsWith('http')) {
          await deleteImage(image.imageUrl)
          console.log(`[DELETE IMAGE] Physical file deleted: ${image.imageUrl}`)
        } else {
          console.log(`[DELETE IMAGE] Skipping physical file deletion for URL: ${image.imageUrl}`)
        }
      } catch (fileError) {
        console.warn(`[DELETE IMAGE] Failed to delete physical file: ${image.imageUrl}`, fileError)
        // 不抛出错误，因为数据库记录已删除
      }
    })

    console.log(`[DELETE IMAGE] Successfully deleted image ID: ${imageId}`)
    return NextResponse.json({ 
      success: true,
      message: "图片删除成功" 
    })

  } catch (error) {
    console.error(`[DELETE IMAGE] Error deleting image ID: ${imageId}`, error)
    logError(error as Error, { endpoint: '/api/gallery/[id]', imageId })
    
    if (error instanceof AppError) {
      const errorResponse = createErrorResponse(error, 'zh')
      return NextResponse.json(errorResponse, { status: error.statusCode })
    }
    
    const serverError = new AppError(ErrorCode.INTERNAL_SERVER_ERROR, 'Failed to delete image', 500)
    const errorResponse = createErrorResponse(serverError, 'zh')
    return NextResponse.json(errorResponse, { status: 500 })
  }
}