import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userImages = await prisma.generatedImage.findMany({
      where: {
        userEmail: session.user.email
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        prompt: true,
        imageUrl: true,
        createdAt: true,
        location: true
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