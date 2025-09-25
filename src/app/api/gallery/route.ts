import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // 首先获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const userImages = await prisma.generatedImage.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        prompt: true,
        imageUrl: true,
        createdAt: true,
        location: true,
        locationLat: true,
        locationLng: true
      }
    })

    return NextResponse.json({
      images: userImages,
      total: userImages.length
    })

  } catch (error: unknown) {
    console.error('Gallery API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: "Failed to fetch gallery",
        details: errorMessage 
      },
      { status: 500 }
    )
  }
}