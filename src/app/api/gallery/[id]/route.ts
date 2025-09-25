import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { deleteImage } from "@/lib/storage"

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
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      )
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
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      )
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
      return NextResponse.json(
        { error: "图片不存在或无权限删除" },
        { status: 404 }
      )
    }

    console.log(`[DELETE IMAGE] Image found: ${image.imageUrl}`)

    // 使用事务确保数据一致性
    await prisma.$transaction(async (tx: any) => {
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
    
    // 提供更具体的错误信息
    let errorMessage = "删除图片时发生错误"
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: "请稍后重试，如果问题持续存在请联系支持"
      },
      { status: 500 }
    )
  }
}