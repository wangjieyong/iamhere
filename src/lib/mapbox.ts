/**
 * Mapbox Configuration
 * 
 * 管理Mapbox地图和地理编码服务的配置
 */

export const MAPBOX_CONFIG = {
  // Mapbox访问令牌
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
  
  // 默认地图样式
  style: 'mapbox://styles/mapbox/streets-v12',
  
  // 默认地图中心点（全球中心）
  defaultCenter: {
    lng: 0,
    lat: 0
  },
  
  // 默认缩放级别
  defaultZoom: 10,
  
  // 地理编码API配置
  geocoding: {
    baseUrl: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
    limit: 10, // 搜索结果数量限制
    types: ['country', 'region', 'postcode', 'district', 'place', 'locality', 'neighborhood', 'address', 'poi'], // 搜索类型
    language: 'en' // 搜索语言，使用英语作为默认语言
  }
}

/**
 * 检查Mapbox配置是否有效
 */
export function isMapboxConfigured(): boolean {
  return !!MAPBOX_CONFIG.accessToken && MAPBOX_CONFIG.accessToken !== 'your-mapbox-access-token'
}

/**
 * 地理编码搜索接口
 */
export interface GeocodeResult {
  id: string
  place_name: string
  center: [number, number] // [lng, lat]
  place_type: string[]
  properties: {
    address?: string
    category?: string
  }
  context?: Array<{
    id: string
    text: string
  }>
}

/**
 * 预处理搜索查询字符串
 */
function preprocessSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/\s+/g, ' ') // 合并多个空格
    .replace(/[，。！？；：""''（）【】]/g, ' ') // 替换中文标点为空格
    .replace(/[,\.!\?;:"'()\[\]]/g, ' ') // 替换英文标点为空格
    .trim()
}

/**
 * 地理编码搜索：根据查询字符串搜索地点
 */
export async function geocodeSearch(query: string): Promise<GeocodeResult[]> {
  if (!isMapboxConfigured()) {
    return getMockGeocodeResults(query)
  }

  // 预处理搜索查询
  const processedQuery = preprocessSearchQuery(query)
  if (!processedQuery) {
    return []
  }

  try {
    const url = new URL(MAPBOX_CONFIG.geocoding.baseUrl + `/${encodeURIComponent(processedQuery)}.json`)
    url.searchParams.set('access_token', MAPBOX_CONFIG.accessToken)
    url.searchParams.set('limit', MAPBOX_CONFIG.geocoding.limit.toString())
    url.searchParams.set('language', MAPBOX_CONFIG.geocoding.language)
    
    // 添加搜索类型
    if (MAPBOX_CONFIG.geocoding.types.length > 0) {
      url.searchParams.set('types', MAPBOX_CONFIG.geocoding.types.join(','))
    }
    
    // 移除地理边界和国家限制，支持全球搜索
    
    // 启用模糊匹配
    url.searchParams.set('fuzzyMatch', 'true')
    
    // 添加自动完成功能
    url.searchParams.set('autocomplete', 'true')

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`)
    }

    const data = await response.json()
    const results = data.features || []
    
    // 对结果进行后处理和排序
    return postProcessSearchResults(results, processedQuery)
  } catch (error) {
    console.error('Geocoding search error:', error)
    return getMockGeocodeResults(query)
  }
}

/**
 * 后处理搜索结果，提升相关性
 */
function postProcessSearchResults(results: GeocodeResult[], query: string): GeocodeResult[] {
  const queryLower = query.toLowerCase()
  
  return results
    .map(result => ({
      ...result,
      // 计算相关性分数
      relevanceScore: calculateRelevanceScore(result, queryLower)
    }))
    .sort((a, b) => (b as GeocodeResult & { relevanceScore: number }).relevanceScore - (a as GeocodeResult & { relevanceScore: number }).relevanceScore)
    .map(({ relevanceScore, ...result }) => result) // 移除临时的分数字段
}

/**
 * 计算搜索结果的相关性分数
 */
function calculateRelevanceScore(result: GeocodeResult, query: string): number {
  let score = 0
  const placeName = result.place_name.toLowerCase()
  const firstPart = result.place_name.split(',')[0].toLowerCase()
  
  // 完全匹配加分
  if (firstPart === query) score += 100
  if (placeName.includes(query)) score += 50
  
  // 开头匹配加分
  if (firstPart.startsWith(query)) score += 30
  if (placeName.startsWith(query)) score += 20
  
  // 地点类型优先级（全球通用）
  if (result.place_type.includes('place')) score += 15
  if (result.place_type.includes('poi')) score += 10
  if (result.place_type.includes('address')) score += 5
  
  return score
}

/**
 * 反向地理编码：根据坐标获取地址信息
 */
export async function reverseGeocode(lng: number, lat: number): Promise<GeocodeResult | null> {
  if (!isMapboxConfigured()) {
    return getMockReverseGeocodeResult(lng, lat)
  }

  try {
    const url = new URL(MAPBOX_CONFIG.geocoding.baseUrl + `/${lng},${lat}.json`)
    url.searchParams.set('access_token', MAPBOX_CONFIG.accessToken)
    url.searchParams.set('limit', '1')
    url.searchParams.set('language', MAPBOX_CONFIG.geocoding.language)

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status}`)
    }

    const data = await response.json()
    return data.features?.[0] || null
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return getMockReverseGeocodeResult(lng, lat)
  }
}

/**
 * 模拟地理编码搜索结果（用于开发和测试）
 */
function getMockGeocodeResults(query: string): GeocodeResult[] {
  const mockData: GeocodeResult[] = [
    {
      id: 'mock-1',
      place_name: '天安门广场, 北京市, 中国',
      center: [116.4074, 39.9042],
      place_type: ['poi'],
      properties: {
        address: '北京市东城区天安门广场',
        category: 'landmark'
      }
    },
    {
      id: 'mock-2',
      place_name: '上海外滩, 上海市, 中国',
      center: [121.4737, 31.2304],
      place_type: ['poi'],
      properties: {
        address: '上海市黄浦区外滩',
        category: 'landmark'
      }
    },
    {
      id: 'mock-3',
      place_name: '香港中环, 香港特别行政区',
      center: [114.1694, 22.3193],
      place_type: ['place'],
      properties: {
        address: '香港特别行政区中环',
        category: 'district'
      }
    }
  ]

  return mockData.filter(item => 
    item.place_name.toLowerCase().includes(query.toLowerCase())
  )
}

/**
 * 模拟反向地理编码结果
 */
function getMockReverseGeocodeResult(lng: number, lat: number): GeocodeResult {
  return {
    id: 'mock-reverse',
    place_name: `位置 ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    center: [lng, lat],
    place_type: ['address'],
    properties: {
      address: `经度: ${lng.toFixed(4)}, 纬度: ${lat.toFixed(4)}`
    }
  }
}