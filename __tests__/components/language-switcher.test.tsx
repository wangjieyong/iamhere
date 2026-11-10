import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

// Mock the i18n module
jest.mock('@/lib/i18n', () => ({
  getLocale: jest.fn(),
  setCookie: jest.fn(),
  t: jest.fn(),
}));

// Mock the useTranslation hook
jest.mock('@/hooks/use-translation', () => ({
  useTranslation: jest.fn(),
}));

import { useTranslation } from '@/hooks/use-translation';

describe('LanguageSwitcher', () => {
  const mockSetLocale = jest.fn();
  const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

  const mockTranslations = (locale: 'en' | 'zh' = 'en') => ({
    t: jest.fn((key: string) => key),
    locale,
    setLocale: mockSetLocale,
    isHydrated: true,
    isInitialized: true,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTranslation.mockReturnValue(mockTranslations('en'));
  });

  it('should render language switcher button', () => {
    render(<LanguageSwitcher />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should display "中文" when current locale is English', () => {
    mockUseTranslation.mockReturnValue(mockTranslations('en'));

    render(<LanguageSwitcher />);
    
    expect(screen.getByText('中文')).toBeInTheDocument();
  });

  it('should display "EN" when current locale is Chinese', () => {
    mockUseTranslation.mockReturnValue(mockTranslations('zh'));

    render(<LanguageSwitcher />);
    
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('should call setLocale with "zh" when clicked and current locale is "en"', () => {
    mockUseTranslation.mockReturnValue(mockTranslations('en'));

    render(<LanguageSwitcher />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockSetLocale).toHaveBeenCalledWith('zh');
  });

  it('should call setLocale with "en" when clicked and current locale is "zh"', () => {
    mockUseTranslation.mockReturnValue(mockTranslations('zh'));

    render(<LanguageSwitcher />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockSetLocale).toHaveBeenCalledWith('en');
  });

  it('should toggle between languages when clicked multiple times', async () => {
    let currentLocale = 'en';
    
    mockUseTranslation.mockImplementation(() => ({
      t: jest.fn((key) => key),
      locale: currentLocale as 'en' | 'zh',
      setLocale: (newLocale: string) => {
        currentLocale = newLocale;
        mockSetLocale(newLocale);
      },
      isHydrated: true,
      isInitialized: true,
    }));

    const { rerender } = render(<LanguageSwitcher />);
    
    // Initially should show "中文" (switch to Chinese)
    expect(screen.getByText('中文')).toBeInTheDocument();
    
    // Click to switch to Chinese
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockSetLocale).toHaveBeenCalledWith('zh');
    
    // Update the mock to reflect the new locale
    mockUseTranslation.mockReturnValue(mockTranslations('zh'));
    
    rerender(<LanguageSwitcher />);
    
    // Now should show "EN" (switch to English)
    expect(screen.getByText('EN')).toBeInTheDocument();
    
    // Click to switch back to English
    fireEvent.click(button);
    
    expect(mockSetLocale).toHaveBeenCalledWith('en');
  });
});