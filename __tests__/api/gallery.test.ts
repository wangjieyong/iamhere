import { GET } from '@/app/api/gallery/route'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'

// Mock dependencies. The route only needs the auth options object; mocking it
// avoids loading NextAuth's ESM-only OAuth dependencies under Jest.
jest.mock('@/lib/auth', () => ({ authOptions: {} }))
jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    generatedImage: {
      findMany: jest.fn(),
    },
  },
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockUserFindUnique = prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>
const mockFindMany = prisma.generatedImage.findMany as jest.MockedFunction<typeof prisma.generatedImage.findMany>

describe('/api/gallery', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return user images successfully', async () => {
      const mockSession = {
        user: { id: 'user123', email: 'test@example.com' },
        expires: '2025-01-01',
      }
      const mockImages = [
        {
          id: 'img1',
          imageUrl: 'https://example.com/image1.jpg',
          prompt: 'Test prompt 1',
          location: 'Test Location 1',
          locationLat: 1.23,
          locationLng: 4.56,
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'img2',
          imageUrl: 'https://example.com/image2.jpg',
          prompt: 'Test prompt 2',
          location: 'Test Location 2',
          locationLat: 7.89,
          locationLng: 0.12,
          createdAt: new Date('2024-01-02'),
        },
      ]

      mockGetServerSession.mockResolvedValue(mockSession)
      mockUserFindUnique.mockResolvedValue({ id: 'user123' } as never)
      mockFindMany.mockResolvedValue(mockImages as never)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      // JSON serialization turns Date instances into ISO strings.
      expect(data.images).toEqual(JSON.parse(JSON.stringify(mockImages)))
      expect(data.total).toBe(2)
      expect(mockFindMany).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          prompt: true,
          imageUrl: true,
          createdAt: true,
          location: true,
          locationLat: true,
          locationLng: true,
        },
      })
    })

    it('should return 401 when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('UNAUTHORIZED')
      expect(mockUserFindUnique).not.toHaveBeenCalled()
      expect(mockFindMany).not.toHaveBeenCalled()
    })

    it('should return 404 when the session user no longer exists', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'deleted-user', email: 'test@example.com' },
        expires: '2025-01-01',
      })
      mockUserFindUnique.mockResolvedValue(null)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('UNAUTHORIZED')
      expect(mockFindMany).not.toHaveBeenCalled()
    })

    it('should handle database errors', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user123', email: 'test@example.com' },
        expires: '2025-01-01',
      })
      mockUserFindUnique.mockResolvedValue({ id: 'user123' } as never)
      mockFindMany.mockRejectedValue(new Error('Database error'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('INTERNAL_SERVER_ERROR')
    })

    it('should return an empty array when user has no images', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user123', email: 'test@example.com' },
        expires: '2025-01-01',
      })
      mockUserFindUnique.mockResolvedValue({ id: 'user123' } as never)
      mockFindMany.mockResolvedValue([])

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.images).toEqual([])
      expect(data.total).toBe(0)
    })
  })
})
