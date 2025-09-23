import { geocodeSearch, reverseGeocode, isMapboxConfigured, MAPBOX_CONFIG } from '@/lib/mapbox'

// Mock fetch
global.fetch = jest.fn()

describe('Mapbox Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = 'test-token'
  })

  describe('geocodeSearch', () => {
    it('should return mock data when Mapbox is not configured', async () => {
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = ''
      
      const result = await geocodeSearch('北京')

      expect(result).toHaveLength(1)
      expect(result[0].place_name).toBe('天安门广场, 北京市, 中国')
      expect(result[0].center).toEqual([116.4074, 39.9042])
    })

    it('should call Mapbox API when configured', async () => {
      // Reset modules to get fresh config
      jest.resetModules()
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = 'valid-token'
      
      const { geocodeSearch: freshGeocodeSearch } = require('@/lib/mapbox')
      
      const mockResponse = {
        features: [
          {
            id: 'test-id',
            place_name: 'Test Location',
            center: [120.123, 30.456],
            place_type: ['place'],
            properties: {}
          }
        ]
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await freshGeocodeSearch('test query')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('mapbox.com/geocoding/v5/mapbox.places/test%20query.json')
      )
      expect(result).toEqual(mockResponse.features)
    })

    it('should return mock data on API errors', async () => {
      // Reset modules to get fresh config
      jest.resetModules()
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = 'valid-token'
      
      const { geocodeSearch: freshGeocodeSearch } = require('@/lib/mapbox')
      
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400
      })

      const result = await freshGeocodeSearch('北京')

      expect(result).toHaveLength(1)
      expect(result[0].place_name).toBe('天安门广场, 北京市, 中国')
    })

    it('should return mock data on network errors', async () => {
      // Reset modules to get fresh config
      jest.resetModules()
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = 'valid-token'
      
      const { geocodeSearch: freshGeocodeSearch } = require('@/lib/mapbox')
      
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const result = await freshGeocodeSearch('北京')

      expect(result).toHaveLength(1)
      expect(result[0].place_name).toBe('天安门广场, 北京市, 中国')
    })
  })

  describe('reverseGeocode', () => {
    it('should return mock data when Mapbox is not configured', async () => {
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = ''
      
      const result = await reverseGeocode(120.123, 30.456)

      expect(result).toBeDefined()
      expect(result?.place_name).toBe('位置 30.4560, 120.1230')
      expect(result?.center).toEqual([120.123, 30.456])
    })

    it('should call Mapbox API when configured', async () => {
      // Reset modules to get fresh config
      jest.resetModules()
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = 'valid-token'
      
      const { reverseGeocode: freshReverseGeocode } = require('@/lib/mapbox')
      
      const mockResponse = {
        features: [
          {
            id: 'test-id',
            place_name: 'Test Location',
            center: [120.123, 30.456],
            place_type: ['place'],
            properties: {}
          }
        ]
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await freshReverseGeocode(120.123, 30.456)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('mapbox.com/geocoding/v5/mapbox.places/120.123,30.456.json')
      )
      expect(result).toEqual(mockResponse.features[0])
    })

    it('should return mock data on API errors', async () => {
      // Reset modules to get fresh config
      jest.resetModules()
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = 'valid-token'
      
      const { reverseGeocode: freshReverseGeocode } = require('@/lib/mapbox')
      
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400
      })

      const result = await freshReverseGeocode(120.123, 30.456)

      expect(result).toBeDefined()
      expect(result?.place_name).toBe('位置 30.4560, 120.1230')
    })
  })

  describe('isMapboxConfigured', () => {
    it('should return false when access token is not configured', () => {
      // Reset environment variable
      delete process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      
      // Re-import to get fresh config
      jest.resetModules()
      const { isMapboxConfigured: freshIsMapboxConfigured } = require('@/lib/mapbox')
      
      const result = freshIsMapboxConfigured()
      
      expect(result).toBe(false)
    })

    it('should return false when access token is empty', () => {
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = ''
      
      jest.resetModules()
      const { isMapboxConfigured: freshIsMapboxConfigured } = require('@/lib/mapbox')
      
      const result = freshIsMapboxConfigured()
      
      expect(result).toBe(false)
    })

    it('should return false when access token is placeholder', () => {
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = 'your-mapbox-access-token'
      
      jest.resetModules()
      const { isMapboxConfigured: freshIsMapboxConfigured } = require('@/lib/mapbox')
      
      const result = freshIsMapboxConfigured()
      
      expect(result).toBe(false)
    })
  })

  describe('MAPBOX_CONFIG', () => {
    it('should have correct default configuration', () => {
      expect(MAPBOX_CONFIG.style).toBe('mapbox://styles/mapbox/streets-v12')
      expect(MAPBOX_CONFIG.defaultCenter).toEqual({ lng: 0, lat: 0 })
      expect(MAPBOX_CONFIG.defaultZoom).toBe(10)
      expect(MAPBOX_CONFIG.geocoding.limit).toBe(10)
      expect(MAPBOX_CONFIG.geocoding.language).toBe('en')
    })
  })
})