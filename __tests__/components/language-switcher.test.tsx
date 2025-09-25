import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import * as i18n from '@/lib/i18n';

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

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      t: jest.fn((key) => key),
      locale: 'en',
      setLocale: mockSetLocale,
    });
  });

  it('should render language switcher button', () => {
    render(<LanguageSwitcher />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should display "中文" when current locale is English', () => {
    mockUseTranslation.mockReturnValue({
      t: jest.fn((key) => key),
      locale: 'en',
      setLocale: mockSetLocale,
    });

    render(<LanguageSwitcher />);
    
    expect(screen.getByText('中文')).toBeInTheDocument();
  });

  it('should display "EN" when current locale is Chinese', () => {
    mockUseTranslation.mockReturnValue({
      t: jest.fn((key) => key),
      locale: 'zh',
      setLocale: mockSetLocale,
    });

    render(<LanguageSwitcher />);
    
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('should call setLocale with "zh" when clicked and current locale is "en"', () => {
    mockUseTranslation.mockReturnValue({
      t: jest.fn((key) => key),
      locale: 'en',
      setLocale: mockSetLocale,
    });

    render(<LanguageSwitcher />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockSetLocale).toHaveBeenCalledWith('zh');
  });

  it('should call setLocale with "en" when clicked and current locale is "zh"', () => {
    mockUseTranslation.mockReturnValue({
      t: jest.fn((key) => key),
      locale: 'zh',
      setLocale: mockSetLocale,
    });

    render(<LanguageSwitcher />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockSetLocale).toHaveBeenCalledWith('en');
  });

  it('should toggle between languages when clicked multiple times', async () => {
    let currentLocale = 'en';
    
    mockUseTranslation.mockImplementation(() => ({
      t: jest.fn((key) => key),
      locale: currentLocale as any,
      setLocale: (newLocale: string) => {
        currentLocale = newLocale;
        mockSetLocale(newLocale);
      },
    }));

    const { rerender } = render(<LanguageSwitcher />);
    
    // Initially should show "中文" (switch to Chinese)
    expect(screen.getByText('中文')).toBeInTheDocument();
    
    // Click to switch to Chinese
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockSetLocale).toHaveBeenCalledWith('zh');
    
    // Update the mock to reflect the new locale
    mockUseTranslation.mockReturnValue({
      t: jest.fn((key) => key),
      locale: 'zh',
      setLocale: mockSetLocale,
    });
    
    rerender(<LanguageSwitcher />);
    
    // Now should show "EN" (switch to English)
    expect(screen.getByText('EN')).toBeInTheDocument();
    
    // Click to switch back to English
    fireEvent.click(button);
    
    expect(mockSetLocale).toHaveBeenCalledWith('en');
  });
});