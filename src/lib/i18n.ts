// 类型定义
export type Locale = 'zh' | 'en';

interface Translations {
  [locale: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  zh: {
    // 导航
    'nav.home': '首页',
    'nav.create': '开始创作',
    'nav.gallery': '图库',
    
    // 首页
    'home.title': '此刻，身在四方。',
    'home.subtitle': 'AI 带你环游世界，只需一张自拍。',
    'home.description': '你在哪里，世界就在哪里。',
    'home.cta': '立即免费体验',
    'home.whyUnique': '为何独一无二？',
    'home.globalLocations': '全球地点',
    'home.globalLocationsDesc': '覆盖世界各地知名景点',
    'home.fastGeneration': '快速生成',
    'home.fastGenerationDesc': '几秒钟内完成AI创作',
    'home.freeToUse': '免费使用',
    'home.freeToUseDesc': '无需付费，立即体验',
    'home.generateFirst': '生成你的第一张 AI 旅行大片',
    
    // 功能介绍
    'home.features.title': 'AI旅行影像生成',
    'home.features.description': '上传自拍 + 选择地点 = 专属旅行大片',
    
    // 使用步骤
    'home.howItWorks.title': '三步，开启时空漫游',
    'home.howItWorks.step1.title': '📸 拍张照，上传',
    'home.howItWorks.step1.description': '你的瞬间，一秒上传，支持多种图片格式',
    'home.howItWorks.step2.title': '🗺️ 选个地，到达',
    'home.howItWorks.step2.description': '全球景点，你的远方，想去哪就去哪',
    'home.howItWorks.step3.title': '✨ 变大片，创造',
    'home.howItWorks.step3.description': 'AI 魔法，你的故事，瞬间穿越时空',
    
    // 创建页面
    'create.backToHome': '返回首页',
    'create.workshop': 'AI创作工坊',
    'create.title': '创造你的AI旅行体验',
    'create.subtitle': '上传照片，选择地点，AI帮你创作专属旅行大片',
    'create.step1': '上传照片',
    'create.step2': '选择地点',
    'create.startGenerate': '开始生成',
    'create.loading': '正在加载...',
    'create.redirecting': '正在跳转到登录页面...',
    'create.uploadAndSelect': '请上传图片并选择地理位置',
    'create.invalidFormat': '选择的图片格式无效，请重新上传',
    'create.loginRequired': '请先登录后再使用图片生成功能',
    'create.dailyLimitReached': '今日使用次数已达上限，请明天再试',
    'create.startCreating': '开始AI创作',
    'create.generating': '正在生成中...',
    'create.generationComplete': '生成完成！',
    'create.viewInGallery': '查看图库',
    'create.createAnother': '再创作一张',
    'create.resultTitle': '你的AI旅行大片已生成！',
    'create.location': '地点：',
    'create.originalImage': '原始图片',
    'create.generatedImage': 'AI生成图片',
    'create.downloadImage': '下载图片',
    'create.createAgain': '重新创作',
    
    // Gallery page
    'gallery.title': '我的AI旅行图片',
    'gallery.loading': '正在加载...',
    'gallery.redirecting': '正在跳转到登录页面...',
    'gallery.loadingGallery': '正在加载图库...',
    'gallery.backToHome': '返回首页',
    'gallery.myGallery': '我的图库',
    'gallery.newCreation': '新建创作',
    'gallery.noWorks': '还没有创作作品',
    'gallery.startFirstCreation': '开始你的第一次AI旅行创作，生成独特的旅行场景图片',
    'gallery.startCreating': '开始创作',
    'gallery.myAIWorks': '我的AI旅行作品',
    'gallery.totalWorks': '共',
    'gallery.worksUnit': '张作品',
    'gallery.aiGeneratedImage': 'AI生成图片',
    'gallery.download': '下载',
    'gallery.share': '分享',
    'gallery.delete': '删除',
    'gallery.shareTitle': '我的AI旅行图片',
    'gallery.shareText': '在',
    'gallery.linkCopied': '链接已复制到剪贴板',
    'gallery.deleteTitle': '删除图片',
    'gallery.deleteMessage': '确定要删除这张图片吗？此操作无法撤销。',
    'gallery.deleteConfirm': '删除',
    'gallery.deleteCancel': '取消',
    'gallery.deleteFailed': '删除失败，请稍后重试',
    'gallery.deleteLoginRequired': '请先登录后再删除图片',
    'gallery.imageNotFound': '图片不存在或已被删除',
    'gallery.deleteNetworkError': '删除失败，请检查网络连接后重试',
    'gallery.workDetails': '作品详情',
    'gallery.location': '地点',
    'gallery.creationTime': '创作时间',
    'gallery.aiPrompt': 'AI提示词',
    'gallery.aiTravelAt': '在{location}的AI旅行体验',
    'gallery.confirmDelete': '确定要删除这张图片吗？',
    'gallery.deleteSuccess': '图片删除成功',
    'gallery.empty': '还没有创作作品',
    'gallery.emptyDesc': '快去创作你的第一张AI旅行照片吧！',
    
    // 登录页面
    'signin.title': '欢迎回来',
    'signin.subtitle': '登录开始你的AI旅行之旅',
    'signin.googleLogin': '使用 Google 登录',
    'signin.twitterLogin': '使用 Twitter 登录',
    'signin.terms': '服务条款',
    'signin.privacy': '隐私政策',
    'signin.agreement': '登录即表示您同意我们的{terms}和{privacy}',
    
    // Settings page
    'settings.title': '账户设置',
    'settings.language': '语言设置',
    'settings.languageDesc': '选择您的首选语言',
    'settings.simplifiedChinese': '简体中文',
    'settings.english': 'English',
    'settings.account': '个人信息',
    'settings.accountDesc': '您的基本账户信息',
    'settings.noName': '未设置姓名',
    'settings.twitterAccount': 'Twitter 账户',
    'settings.googleAccount': 'Google 账户',
    'settings.thirdPartyAccount': '第三方账户',
    'settings.usageStats': '使用统计',
    'settings.usageStatsDesc': '您的图片生成使用情况',
    'settings.totalImages': '总生成图片',
    'settings.dailyUsed': '今日已使用',
    'settings.dailyLimit': '每日限额',
    'settings.dailyProgress': '今日使用进度',
    'settings.current': '当前',
    'settings.comingSoon': '即将推出',
    'settings.quickActions': '快捷操作',
    'settings.quickActionsDesc': '常用功能的快速访问',
    'settings.viewGallery': '查看我的图库',
    'settings.createNew': '创建新图片',
    'settings.accountActions': '账户操作',
    'settings.accountActionsDesc': '退出登录或删除账户',
    'settings.deleteAccount': '删除账户',
    'settings.deleteAccountDesc': '永久删除您的账户和所有数据',
    'settings.confirmDelete': '确认删除',
    'settings.deleteWarning': '此操作不可撤销，将永久删除您的账户和所有相关数据。',
    
    // UI components
    'ui.login': '登录',
    'ui.user': '用户',
    'ui.myGallery': '我的图库',
    'ui.accountSettings': '账户设置',
    'ui.logout': '退出登录',
    'ui.confirm': '确认',
    'ui.cancel': '取消',
    'ui.close': '关闭',
    'ui.save': '保存',
    'ui.loading': '加载中...',
    'ui.error': '错误',
    'ui.success': '成功',
    'ui.warning': '警告',
    'ui.info': '信息',
    'ui.back': '返回',
    
    // 地图选择器
    'map.selectLocation': '选择地点',
    'map.search': '搜索',
    'map.searchPlaceholder': '搜索地点...',
    'map.noResults': '未找到相关地点',
    'map.getCurrentLocation': '获取当前位置',
    'map.confirm': '确认选择',
    'map.locationSelected': '已选择位置',
    'map.selectLocationDesc': '在地图上选择任意城市或地标，想去哪就去哪',
    'map.map': '地图',
    'map.location': '定位',
    'map.searchResults': '搜索结果',
    'map.noResultsTip': '请尝试其他关键词或检查拼写',
    'map.recentSearches': '最近搜索',
    'map.searchTip': '支持搜索全球城市、著名景点、地标建筑、详细地址等',
    'map.mapboxRequired': '地图功能需要配置 Mapbox',
    'map.clickMapToSelect': '点击地图上的任意位置选择地点',
    'map.gettingLocation': '获取位置中...',
    'map.locationTip': '点击按钮获取您的当前地理位置',
    'map.mapSelection': '地图选点',
    'map.mapSelectionLocation': '地图选点位置',
    'map.mapSelectedLocation': '地图选择位置',
    'map.coordinates': '坐标',
    'map.reselectLocation': '重新选择地点',
    'map.geolocationNotSupported': '您的浏览器不支持地理定位',
    'map.geolocationFailed': '定位失败，请检查位置权限设置',
    'map.currentLocation': '当前位置',
    
    // 图片上传
    'upload.title': '上传图片',
    'upload.description': '上传一张图片，AI将基于此图片和地理位置生成新的旅行场景',
    'upload.dragDrop': '点击或拖拽图片到此处',
    'upload.dropToUpload': '释放文件以上传',
    'upload.selectAgain': '重新选择图片',
    'upload.supportedFormats': '支持 JPG、PNG、WebP 格式，最大',
    'upload.maxSize': '最大文件大小：10MB',
    'upload.fileSizeError': '文件大小不能超过',
    'upload.validationFailed': '文件验证失败',
    'upload.previewImage': '预览图片',
    
    // 确认对话框
    'dialog.confirmAction': '确认操作',
    'dialog.confirm': '确定',
    'dialog.cancel': '取消',
    
    // 错误信息
    'error.loginRequired': '请先登录',
    'error.unauthorized': '没有权限执行此操作',
    'error.dailyLimitReached': '今日生成次数已达上限',
    'error.invalidImage': '无效的图片格式',
    'error.uploadFailed': '图片上传失败',
    'error.networkError': '网络连接错误',
    'error.serverError': '服务器错误',
    'error.unknownError': '未知错误',
    
    // Authentication
    'auth.welcomeBack': '欢迎回来',
    'auth.signInDescription': '登录开始你的AI旅行之旅',
    'auth.signingIn': '登录中...',
    'auth.signInWithGoogle': '使用 Google 登录',
    'auth.signInWithTwitter': '使用 Twitter 登录',
    'auth.agreementText': '登录即表示您同意我们的',
    'auth.termsOfService': '服务条款',
    'auth.and': '和',
    'auth.privacyPolicy': '隐私政策',
    'auth.backToHome': '返回首页',
    
    // 语言
    'language.chinese': '中文',
    'language.english': 'English',
    
    // 通用按钮
    'common.generate': '生成',
    'common.download': '下载',
    'common.share': '分享',
    
    // 元数据
    'meta.title': 'IAmHere - AI Travel Shot',
    'meta.description': '上传自拍，选择地点，AI瞬间生成专属旅行大片。免费体验AI带你环游世界的魅力。',
    'meta.keywords': 'AI旅行,照片生成,人工智能,旅行摄影,自拍,地点,免费',
    'meta.author': 'IAmHere',
    'meta.siteName': '此刻，身在四方'
  },
  en: {
    // 导航
    'nav.home': 'Home',
    'nav.create': 'Create',
    'nav.gallery': 'Gallery',
    
    // 首页
    'home.title': 'Anywhere, Everywhere.',
    'home.subtitle': 'One snap. AI does the rest.',
    'home.description': 'Wherever you are, the world awaits.',
    'home.cta': 'Try Free Now',
    'home.whyUnique': 'Why Unique?',
    'home.globalLocations': 'Global Destinations',
    'home.globalLocationsDesc': 'Covering famous landmarks worldwide',
    'home.fastGeneration': 'Fast Generation',
    'home.fastGenerationDesc': 'Complete AI creation in seconds',
    'home.freeToUse': 'Free to Use',
    'home.freeToUseDesc': 'No payment required, try instantly',
    'home.generateFirst': 'Generate Your First AI Travel Photo',
    
    // Features
    'home.features.title': 'AI Travel Image Generation',
    'home.features.description': 'Upload selfie + Choose destination = Instant travel magic',
    
    // How it works
    'home.howItWorks.title': 'Three Steps to Time Travel',
    'home.howItWorks.step1.title': '📸 Upload',
    'home.howItWorks.step1.description': 'Your moment, instant upload, supports multiple image formats',
    'home.howItWorks.step2.title': '🗺️ Choose',
    'home.howItWorks.step2.description': 'Global destinations, your journey, go wherever you want',
    'home.howItWorks.step3.title': '✨ Create',
    'home.howItWorks.step3.description': 'AI magic, your story, instantly travel through time and space',
    
    // Create page
    'create.backToHome': 'Back to Home',
    'create.workshop': 'AI Creation Workshop',
    'create.title': 'Create Your AI Travel Experience',
    'create.subtitle': 'Upload. Select. Create. AI crafts your travel masterpiece.',
    'create.step1': 'Upload Photo',
    'create.step2': 'Select Location',
    'create.startGenerate': 'Start Generation',
    'create.loading': 'Loading...',
    'create.redirecting': 'Redirecting to login page...',
    'create.uploadAndSelect': 'Please upload an image and select a location',
    'create.invalidFormat': 'Invalid image format selected, please upload again',
    'create.loginRequired': 'Please login first to use the image generation feature',
    'create.dailyLimitReached': 'Daily usage limit reached, please try again tomorrow',
    'create.startCreating': 'Start AI Creation',
    'create.generating': 'Generating...',
    'create.generationComplete': 'Generation Complete!',
    'create.viewInGallery': 'View Gallery',
    'create.createAnother': 'Create Another',
    'create.resultTitle': 'Your AI Travel Masterpiece is Ready!',
    'create.location': 'Location: ',
    'create.originalImage': 'Original Image',
    'create.generatedImage': 'AI Generated Image',
    'create.downloadImage': 'Download Image',
    'create.createAgain': 'Create Again',
    
    // Gallery page
    'gallery.title': 'My AI Travel Photos',
    'gallery.loading': 'Loading...',
    'gallery.redirecting': 'Redirecting to login page...',
    'gallery.loadingGallery': 'Loading gallery...',
    'gallery.backToHome': 'Back to Home',
    'gallery.myGallery': 'My Gallery',
    'gallery.newCreation': 'New Creation',
    'gallery.noWorks': 'No creations yet',
    'gallery.startFirstCreation': 'Start your first AI travel creation and generate unique travel scene images',
    'gallery.startCreating': 'Start Creating',
    'gallery.myAIWorks': 'My AI Travel Works',
    'gallery.totalWorks': 'Total',
    'gallery.worksUnit': 'works',
    'gallery.aiGeneratedImage': 'AI Generated Image',
    'gallery.download': 'Download',
    'gallery.share': 'Share',
    'gallery.delete': 'Delete',
    'gallery.shareTitle': 'My AI Travel Photos',
    'gallery.shareText': 'AI travel experience at',
    'gallery.linkCopied': 'Link copied to clipboard',
    'gallery.deleteTitle': 'Delete Photo',
    'gallery.deleteMessage': 'Are you sure you want to delete this photo? This action cannot be undone.',
    'gallery.deleteConfirm': 'Delete',
    'gallery.deleteCancel': 'Cancel',
    'gallery.deleteFailed': 'Delete failed, please try again later',
    'gallery.deleteLoginRequired': 'Please login first to delete photos',
    'gallery.imageNotFound': 'Image not found or has been deleted',
    'gallery.deleteNetworkError': 'Delete failed, please check your network connection and try again',
    'gallery.workDetails': 'Work Details',
    'gallery.location': 'Location',
    'gallery.creationTime': 'Creation Time',
    'gallery.aiPrompt': 'AI Prompt',
    'gallery.aiTravelAt': 'AI Travel Experience at {location}',
    'gallery.confirmDelete': 'Are you sure you want to delete this photo?',
    'gallery.deleteSuccess': 'Photo deleted successfully',
    'gallery.empty': 'No creations yet',
    'gallery.emptyDesc': 'Go create your first AI travel photo!',
    
    // Sign in page
    'signin.title': 'Welcome Back',
    'signin.subtitle': 'Sign in to start your AI travel journey',
    'signin.googleLogin': 'Sign in with Google',
    'signin.twitterLogin': 'Sign in with Twitter',
    'signin.terms': 'Terms of Service',
    'signin.privacy': 'Privacy Policy',
    'signin.agreement': 'By signing in, you agree to our {terms} and {privacy}',
    
    // Settings page
    'settings.title': 'Account Settings',
    'settings.language': 'Language Settings',
    'settings.languageDesc': 'Choose your preferred language',
    'settings.simplifiedChinese': '简体中文',
    'settings.english': 'English',
    'settings.account': 'Personal Information',
    'settings.accountDesc': 'Your basic account information',
    'settings.noName': 'Name not set',
    'settings.twitterAccount': 'Twitter Account',
    'settings.googleAccount': 'Google Account',
    'settings.thirdPartyAccount': 'Third-party Account',
    'settings.usageStats': 'Usage Statistics',
    'settings.usageStatsDesc': 'Your image generation usage',
    'settings.totalImages': 'Total Generated',
    'settings.dailyUsed': 'Used Today',
    'settings.dailyLimit': 'Daily Limit',
    'settings.dailyProgress': 'Daily Progress',
    'settings.current': 'Current',
    'settings.comingSoon': 'Coming Soon',
    'settings.quickActions': 'Quick Actions',
    'settings.quickActionsDesc': 'Quick access to common features',
    'settings.viewGallery': 'View My Gallery',
    'settings.createNew': 'Create New Image',
    'settings.accountActions': 'Account Actions',
    'settings.accountActionsDesc': 'Sign out or delete account',
    'settings.deleteAccount': 'Delete Account',
    'settings.deleteAccountDesc': 'Permanently delete your account and all data',
    'settings.confirmDelete': 'Confirm Delete',
    'settings.deleteWarning': 'This action cannot be undone. It will permanently delete your account and all related data.',
    
    // UI components
    'ui.login': 'Login',
    'ui.user': 'User',
    'ui.myGallery': 'My Gallery',
    'ui.accountSettings': 'Account Settings',
    'ui.logout': 'Logout',
    'ui.confirm': 'Confirm',
    'ui.cancel': 'Cancel',
    'ui.close': 'Close',
    'ui.save': 'Save',
    'ui.loading': 'Loading...',
    'ui.error': 'Error',
    'ui.success': 'Success',
    'ui.warning': 'Warning',
    'ui.info': 'Info',
    'ui.back': 'Back',
    
    // Map selector
    'map.selectLocation': 'Select Location',
    'map.search': 'Search',
    'map.searchPlaceholder': 'Search for places...',
    'map.noResults': 'No places found',
    'map.getCurrentLocation': 'Get Current Location',
    'map.confirm': 'Confirm Selection',
    'map.locationSelected': 'Location Selected',
    'map.selectLocationDesc': 'Select any city or landmark on the map, go wherever you want',
    'map.map': 'Map',
    'map.location': 'Location',
    'map.searchResults': 'Search Results',
    'map.noResultsTip': 'Please try other keywords or check spelling',
    'map.recentSearches': 'Recent Searches',
    'map.searchTip': 'Support searching cities, attractions, landmarks, addresses, etc.',
    'map.mapboxRequired': 'Map functionality requires Mapbox configuration',
    'map.clickMapToSelect': 'Click anywhere on the map to select a location',
    'map.gettingLocation': 'Getting location...',
    'map.locationTip': 'Click the button to get your location',
    'map.mapSelection': 'Map Selection',
    'map.mapSelectionLocation': 'Map Selection Location',
    'map.mapSelectedLocation': 'Map Selected Location',
    'map.coordinates': 'Coordinates',
    'map.reselectLocation': 'Reselect Location',
    'map.geolocationNotSupported': 'Your browser does not support geolocation',
    'map.geolocationFailed': 'Location failed, please check location permission settings',
    'map.currentLocation': 'Current Location',
    
    // Image upload
    'upload.title': 'Upload Image',
    'upload.description': 'Upload image, AI creates location-based travel scenes',
    'upload.dragDrop': 'Click or drag image here',
    'upload.dropToUpload': 'Drop files to upload',
    'upload.selectAgain': 'Select Another Image',
    'upload.supportedFormats': 'Supports JPG, PNG, WebP formats, max',
    'upload.maxSize': 'Maximum file size: 10MB',
    'upload.fileSizeError': 'File size cannot exceed',
    'upload.validationFailed': 'File validation failed',
    'upload.previewImage': 'Preview Image',
    
    // Confirm dialog
    'dialog.confirmAction': 'Confirm Action',
    'dialog.confirm': 'Confirm',
    'dialog.cancel': 'Cancel',
    
    // Error messages
    'error.loginRequired': 'Please login first',
    'error.unauthorized': 'No permission to perform this action',
    'error.dailyLimitReached': 'Daily generation limit reached',
    'error.invalidImage': 'Invalid image format',
    'error.uploadFailed': 'Image upload failed',
    'error.networkError': 'Network connection error',
    'error.serverError': 'Server error',
    'error.unknownError': 'Unknown error',
    
    // Authentication
    'auth.welcomeBack': 'Welcome Back',
    'auth.signInDescription': 'Sign in to start your AI travel journey',
    'auth.signingIn': 'Signing in...',
    'auth.signInWithGoogle': 'Sign in with Google',
    'auth.signInWithTwitter': 'Sign in with Twitter',
    'auth.agreementText': 'By signing in, you agree to our',
    'auth.termsOfService': 'Terms of Service',
    'auth.and': 'and',
    'auth.privacyPolicy': 'Privacy Policy',
    'auth.backToHome': 'Back to Home',
    
    // Common actions
    'common.generate': 'Generate',
    'common.download': 'Download',
    'common.share': 'Share',
    
    // Language switcher
    'language.chinese': '中文',
    'language.english': 'English',
    
    // Metadata
    'meta.title': 'IAmHere - AI Travel Shot',
    'meta.description': 'One snap. AI does the rest. Choose a location, and AI instantly generates your exclusive travel photos. Experience the magic of AI taking you around the world for free.',
    'meta.keywords': 'AI travel,photo generation,artificial intelligence,travel photography,selfie,location,free',
    'meta.author': 'IAmHere',
    'meta.siteName': 'Anywhere, Everywhere'
  }
};

// Cookie 工具函数
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function setCookie(name: string, value: string, days: number = 365) {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

// 获取当前语言 - 修复SSR水合错误
export function getLocale(): Locale {
  if (typeof window !== 'undefined') {
    // 客户端：从 cookie 读取，如果没有则默认英文
    const cookieLocale = getCookie('locale') as Locale;
    if (cookieLocale && (cookieLocale === 'zh' || cookieLocale === 'en')) {
      return cookieLocale;
    }
    return 'en'; // 默认英文
  }
  
  // 服务端：默认英文
  return 'en';
}

// 设置语言 - 使用cookie而不是localStorage
export function setLocale(locale: Locale) {
  setCookie('locale', locale);
}

// 翻译函数
export function t(key: string, locale?: Locale): string {
  const currentLocale = locale || getLocale();
  
  // 直接使用完整的键来查找翻译
  const translation = translations[currentLocale]?.[key];
  
  return translation || key; // 如果找不到翻译，返回原始 key
}