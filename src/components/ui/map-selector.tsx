"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { MapPin, Search, Loader2, Navigation } from "lucide-react"
import { Button } from "./button"
import { geocodeSearch, reverseGeocode, MAPBOX_CONFIG, isMapboxConfigured } from "@/lib/mapbox"

// 动态导入 Mapbox GL JS
let mapboxgl: typeof import('mapbox-gl').default | null = null
if (typeof window !== 'undefined') {
  import('mapbox-gl').then((module) => {
    mapboxgl = module.default
  })
}

interface Location {
  lat: number
  lng: number
  address: string
  name?: string
}

interface MapSelectorProps {
  onLocationSelect: (location: Location | null) => void
  selectedLocation?: Location
}

export function MapSelector({ onLocationSelect, selectedLocation }: MapSelectorProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'map' | 'location'>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [searchResults, setSearchResults] = useState<Location[]>([])
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<import('mapbox-gl').Map | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)



  // 防抖搜索
  const debouncedSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    
    setIsSearching(true)
    try {
      const results = await geocodeSearch(query)
      const locations: Location[] = results.map(result => ({
        lat: result.center[1],
        lng: result.center[0],
        address: result.place_name,
        name: result.place_name.split(',')[0]
      }))
      setSearchResults(locations)
      
      // 添加到搜索历史
      if (locations.length > 0) {
        setSearchHistory(prev => {
          const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 5)
          return newHistory
        })
      }
    } catch (error) {
      console.error('搜索失败:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // 搜索地点
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return
    await debouncedSearch(searchQuery)
    setShowSuggestions(false)
  }, [searchQuery, debouncedSearch])

  // 处理搜索输入变化
  const handleSearchInputChange = useCallback((value: string) => {
    setSearchQuery(value)
    
    // 清除之前的定时器
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    if (value.trim()) {
      // 生成搜索建议
      const suggestions = [
        ...searchHistory.filter(item => item.includes(value))
      ].slice(0, 5)
      setSearchSuggestions(suggestions)
      setShowSuggestions(true)
      
      // 设置防抖搜索
      searchTimeoutRef.current = setTimeout(() => {
        debouncedSearch(value)
      }, 500)
    } else {
      setShowSuggestions(false)
      setSearchResults([])
    }
  }, [searchHistory, debouncedSearch])

  // 选择搜索建议
  const handleSuggestionSelect = useCallback((suggestion: string) => {
    setSearchQuery(suggestion)
    setShowSuggestions(false)
    debouncedSearch(suggestion)
  }, [debouncedSearch])

  // 获取当前位置
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('您的浏览器不支持地理定位')
      return
    }

    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            const result = await reverseGeocode(latitude, longitude)
            const location: Location = {
              lat: latitude,
              lng: longitude,
              address: result?.place_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              name: '当前位置'
            }
            onLocationSelect(location)
          } catch (error) {
            console.error('获取地址失败:', error)
            const location: Location = {
              lat: latitude,
              lng: longitude,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              name: '当前位置'
            }
            onLocationSelect(location)
          } finally {
            setIsGettingLocation(false)
          }
        },
      (error) => {
        console.error('定位失败:', error)
        setIsGettingLocation(false)
        alert('定位失败，请检查位置权限设置')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }, [onLocationSelect])

  // 初始化地图
  useEffect(() => {
    // 清理现有地图实例
    if (map.current) {
      map.current.remove()
      map.current = null
    }

    // 初始化新地图实例
    if (activeTab === 'map' && mapContainer.current && mapboxgl && isMapboxConfigured()) {
      // 确保容器为空
      mapContainer.current.innerHTML = ''
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [116.4074, 39.9042],
        zoom: 10,
        accessToken: MAPBOX_CONFIG.accessToken
      })

      map.current.on('click', async (e: import('mapbox-gl').MapMouseEvent) => {
        const { lng, lat } = e.lngLat
        try {
          const result = await reverseGeocode(lng, lat)
          const location: Location = {
            lat,
            lng,
            address: result?.place_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            name: '地图选点'
          }
          onLocationSelect(location)
        } catch (error) {
          console.error('获取地址失败:', error)
          const location: Location = {
            lat,
            lng,
            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            name: '地图选点'
          }
          onLocationSelect(location)
        }
      })
    }

    // 清理函数
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [activeTab, onLocationSelect])

  // 处理搜索结果选择
  const handleSearchResultSelect = (location: Location) => {
    onLocationSelect(location)
  }

  return (
    <>
      <div className="space-y-4 h-[400px] flex flex-col">
        {/* 标题 */}
        <div className="space-y-2 flex-shrink-0">
          <label className="text-sm font-medium">选择地理位置</label>
          <p className="text-xs text-muted-foreground">
            选择您想要展示的地点位置
          </p>
        </div>

        {/* 主内容区域 */}
        {!selectedLocation ? (
          /* 选择区域 */
          <div className="relative border-2 border-dashed rounded-lg p-8 border-border hover:border-primary/50 transition-colors flex-1 flex flex-col">
            <div className="space-y-6 h-full flex flex-col">
              {/* 标签页导航 */}
              <div className="bg-gray-100 p-1 rounded-lg">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setActiveTab('search')}
                    className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === 'search'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Search className="h-4 w-4" />
                    <span>搜索</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('map')}
                    className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === 'map'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <MapPin className="h-4 w-4" />
                    <span>地图</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('location')}
                    className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === 'location'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Navigation className="h-4 w-4" />
                    <span>定位</span>
                  </button>
                </div>
              </div>

              {/* 标签页内容 */}
              <div className="flex-1">
                {/* 搜索标签页 */}
                {activeTab === 'search' && (
                  <div className="space-y-4 flex-1 flex flex-col">
                    {/* 搜索输入框 */}
                    <div className="relative">
                      <div className="flex space-x-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearchInputChange(e.target.value)}
                            placeholder="试试输入纽约自由女神像、巴黎埃菲尔铁塔"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            onFocus={() => searchQuery && setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                          />
                          
                          {/* 搜索建议下拉框 */}
                          {showSuggestions && searchSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                              {searchSuggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  onClick={() => handleSuggestionSelect(suggestion)}
                                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                                >
                                  <Search className="h-3 w-3 inline mr-2 text-gray-400" />
                                  {suggestion}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button 
                          onClick={handleSearch} 
                          disabled={isSearching || !searchQuery.trim()}
                          className="px-4"
                        >
                          {isSearching ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            '搜索'
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {/* 搜索结果 */}
                    {searchResults.length > 0 && (
                      <div className="space-y-2 flex-1 overflow-y-auto">
                        <div className="text-xs text-gray-500 mb-2">搜索结果 ({searchResults.length})</div>
                        {searchResults.map((result, index) => (
                          <div
                            key={index}
                            onClick={() => handleSearchResultSelect(result)}
                            className="p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all duration-200"
                          >
                            <div className="flex items-start space-x-2">
                              <MapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900 truncate">
                                  {result.name || result.address.split(',')[0]}
                                </div>
                                <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {result.address}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* 无搜索结果 */}
                    {searchResults.length === 0 && !isSearching && searchQuery && (
                      <div className="text-center text-gray-500 py-8">
                        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>未找到相关地点</p>
                        <p className="text-xs mt-1">请尝试其他关键词或检查拼写</p>
                      </div>
                    )}
                    
                    {/* 默认状态：显示搜索历史和热门搜索 */}
                    {!searchQuery && !isSearching && (
                      <div className="space-y-4 flex-1">
                        {/* 搜索历史 */}
                        {searchHistory.length > 0 && (
                          <div>
                            <div className="text-xs text-gray-500 mb-2">最近搜索</div>
                            <div className="space-y-1">
                              {searchHistory.map((item, index) => (
                                <div
                                  key={index}
                                  onClick={() => handleSuggestionSelect(item)}
                                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                                >
                                  <Search className="h-3 w-3 text-gray-400" />
                                  <span className="text-sm text-gray-700">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        

                        
                        {/* 搜索提示 */}
                        <div className="text-center text-gray-500 py-4">
                          <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">支持搜索全球城市、著名景点、地标建筑、详细地址等</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 地图标签页 */}
                {activeTab === 'map' && (
                  <div className="space-y-4 flex-1 flex flex-col">
                    {isMapboxConfigured() ? (
                      <div
                        ref={mapContainer}
                        className="w-full flex-1 rounded-md border border-gray-300"
                      />
                    ) : (
                      <div className="w-full flex-1 rounded-md border border-gray-300 flex items-center justify-center bg-gray-50">
                        <div className="text-center text-gray-500">
                          <MapPin className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">地图功能需要配置 Mapbox</p>
                        </div>
                      </div>
                    )}
                    <div className="text-center text-gray-500 text-sm">
                      点击地图上的任意位置选择地点
                    </div>
                  </div>
                )}

                {/* 定位标签页 */}
                {activeTab === 'location' && (
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <Navigation className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <Button
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation}
                        className="px-6 mb-4"
                      >
                        {isGettingLocation ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            获取位置中...
                          </>
                        ) : (
                          <>
                            <Navigation className="h-4 w-4 mr-2" />
                            获取当前位置
                          </>
                        )}
                      </Button>
                      <div className="text-gray-500 text-sm">
                        点击按钮获取您的当前地理位置
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* 预览区域 */
          <div className="space-y-3 flex-1 flex flex-col">
            {/* 固定大小的地点预览框 */}
            <div className="relative group">
              <div className="relative w-full h-48 bg-accent rounded-lg overflow-hidden border-2 border-green-200">
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                  <MapPin className="h-12 w-12 text-green-600 mb-3" />
                  <div className="text-center">
                    {(() => {
                      // 判断地址是否为坐标格式（如 "39.904825, 116.395040"）
                      const isCoordinateFormat = /^\d+\.\d+,\s*\d+\.\d+$/.test(selectedLocation.address)
                      
                      if (selectedLocation.name && selectedLocation.name !== '地图选点') {
                        // 有有效的地点名称
                        return (
                          <>
                            <div className="font-medium text-green-900 mb-1">{selectedLocation.name}</div>
                            <div className="text-sm text-green-700 mb-2">{selectedLocation.address}</div>
                          </>
                        )
                      } else if (isCoordinateFormat) {
                        // 地址是坐标格式，显示友好信息
                        return (
                          <>
                            <div className="font-medium text-green-900 mb-1">已选择位置</div>
                            <div className="text-sm text-green-700 mb-2">地图选点位置</div>
                          </>
                        )
                      } else {
                        // 有真实地址信息
                        return (
                          <>
                            <div className="font-medium text-green-900 mb-1">{selectedLocation.address}</div>
                            <div className="text-sm text-green-700 mb-2">地图选择位置</div>
                          </>
                        )
                      }
                    })()}
                    <div className="text-xs text-green-600">
                      坐标: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 重新选择按钮 */}
             <Button
               variant="outline"
               size="sm"
               onClick={() => onLocationSelect(null)}
               className="w-full"
             >
               重新选择地点
             </Button>
          </div>
        )}
      </div>


    </>
  )
}