import { renderHook, act } from '@testing-library/react';
import { useTranslation } from '@/hooks/use-translation';
import * as i18n from '@/lib/i18n';

// Mock the i18n module
jest.mock('@/lib/i18n', () => ({
  getLocale: jest.fn(),
  setCookie: jest.fn(),
  setLocale: jest.fn(),
  t: jest.fn(),
}));

// Mock document.cookie for testing
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
});

describe('useTranslation', () => {
  const mockGetLocale = i18n.getLocale as jest.MockedFunction<typeof i18n.getLocale>;
  const mockSetCookie = i18n.setCookie as jest.MockedFunction<typeof i18n.setCookie>;
  const mockSetLocale = i18n.setLocale as jest.MockedFunction<typeof i18n.setLocale>;
  const mockT = i18n.t as jest.MockedFunction<typeof i18n.t>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset document.cookie
    document.cookie = '';
  });

  it('should initialize with default locale "en"', () => {
    mockGetLocale.mockReturnValue('en');
    
    const { result } = renderHook(() => useTranslation());
    
    expect(result.current.locale).toBe('en');
  });

  it('should load locale from getLocale after hydration', async () => {
    mockGetLocale.mockReturnValue('zh');
    
    const { result } = renderHook(() => useTranslation());
    
    // Initially should be 'en' before hydration
    expect(result.current.locale).toBe('en');
    
    // Wait for useEffect and setTimeout to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    // After hydration should be 'zh'
    expect(result.current.locale).toBe('zh');
    expect(mockGetLocale).toHaveBeenCalled();
  });

  it('should set locale and call setLocale when setLocale is called', () => {
    mockGetLocale.mockReturnValue('en');
    
    const { result } = renderHook(() => useTranslation());
    
    act(() => {
      result.current.setLocale('zh');
    });
    
    expect(mockSetLocale).toHaveBeenCalledWith('zh');
    expect(result.current.locale).toBe('zh');
  });

  it('should immediately use user-set locale even before hydration', () => {
    mockGetLocale.mockReturnValue('en');
    
    const { result } = renderHook(() => useTranslation());
    
    // Before hydration, should be 'en'
    expect(result.current.locale).toBe('en');
    
    // User sets locale to 'zh'
    act(() => {
      result.current.setLocale('zh');
    });
    
    // Should immediately show 'zh' even before hydration
    expect(result.current.locale).toBe('zh');
  });

  it('should call t function with correct locale', () => {
    mockGetLocale.mockReturnValue('en');
    mockT.mockReturnValue('Hello');
    
    const { result } = renderHook(() => useTranslation());
    
    act(() => {
      result.current.t('greeting');
    });
    
    expect(mockT).toHaveBeenCalledWith('greeting', 'en');
  });

  it('should call t function with user-set locale', () => {
    mockGetLocale.mockReturnValue('en');
    mockT.mockReturnValue('你好');
    
    const { result } = renderHook(() => useTranslation());
    
    act(() => {
      result.current.setLocale('zh');
    });
    
    act(() => {
      result.current.t('greeting');
    });
    
    expect(mockT).toHaveBeenCalledWith('greeting', 'zh');
  });

  it('should handle locale switching correctly', () => {
    mockGetLocale.mockReturnValue('en');
    
    const { result } = renderHook(() => useTranslation());
    
    // Initial state
    expect(result.current.locale).toBe('en');
    
    // Switch to Chinese
    act(() => {
      result.current.setLocale('zh');
    });
    
    expect(result.current.locale).toBe('zh');
    expect(mockSetLocale).toHaveBeenCalledWith('zh');
    
    // Switch back to English
    act(() => {
      result.current.setLocale('en');
    });
    
    expect(result.current.locale).toBe('en');
    expect(mockSetLocale).toHaveBeenCalledWith('en');
  });
});