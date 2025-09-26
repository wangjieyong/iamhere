import { GET } from '@/app/api/gallery/route'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('next-auth/next')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    generation: {
      findMany: jest.fn(),
    },
  },
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockPrismaFindMany = prisma.generation.findMany as jest.MockedFunction<typeof prisma.generation.findMany>

describe('/api/gallery', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return user generations successfully', async () => {
      const mockSession = {
        user: { id: 'user123', email: 'test@example.com' }
      }
      const mockGenerations = [
        {
          id: 'gen1',
          imageUrl: 'https://example.com/image1.jpg',
          prompt: 'Test prompt 1',
          location: 'Test Location 1',
          createdAt: new Date('2024-01-01'),
          userId: 'user123'
        },
        {
          id: 'gen2',
          imageUrl: 'https://example.com/image2.jpg',
          prompt: 'Test prompt 2',
          location: 'Test Location 2',
          createdAt: new Date('2024-01-02'),
          userId: 'user123'
        }
      ]

      mockGetServerSession.mockResolvedValue(mockSession)
      mockPrismaFindMany.mockResolvedValue(mockGenerations)

      const request = new NextRequest('http://127.0.0.1:3000/api/gallery')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.generations).toEqual(mockGenerations)
      expect(mockPrismaFindMany).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        orderBy: { createdAt: 'desc' },
        take: 50
      })
    })

    it('should return 401 when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://127.0.0.1:3000/api/gallery')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
      expect(mockPrismaFindMany).not.toHaveBeenCalled()
    })

    it('should handle database errors', async () => {
      const mockSession = {
        user: { id: 'user123', email: 'test@example.com' }
      }

      mockGetServerSession.mockResolvedValue(mockSession)
      mockPrismaFindMany.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://127.0.0.1:3000/api/gallery')
      const response = await GET(request)

      expect(response.status).toBe(500)
    })

    it('should return empty array when user has no generations', async () => {
      const mockSession = {
        user: { id: 'user123', email: 'test@example.com' }
      }

      mockGetServerSession.mockResolvedValue(mockSession)
      mockPrismaFindMany.mockResolvedValue([])

      const request = new NextRequest('http://127.0.0.1:3000/api/gallery')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.generations).toEqual([])
    })
  })
})