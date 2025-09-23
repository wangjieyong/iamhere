import { logError, withErrorHandler, ErrorCode, AppError } from '@/lib/error-handler'

// Mock console methods
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation()

describe('Error Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    mockConsoleError.mockRestore()
  })

  describe('logError', () => {
    it('should log error with context', () => {
      const error = new Error('Test error')
      const context = { userId: '123', action: 'test' }

      logError(error, context)

      expect(mockConsoleError).toHaveBeenCalled()
    })

    it('should log error without context', () => {
      const error = new Error('Test error')

      logError(error)

      expect(mockConsoleError).toHaveBeenCalled()
    })
  })

  describe('withErrorHandler', () => {
    it('should execute function successfully and return result', async () => {
      const mockFn = jest.fn().mockResolvedValue('success')
      const wrappedFn = withErrorHandler(mockFn)
      const result = await wrappedFn()

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockConsoleError).not.toHaveBeenCalled()
    })

    it('should catch and log errors, then rethrow', async () => {
      const error = new Error('Test error')
      const mockFn = jest.fn().mockRejectedValue(error)
      const wrappedFn = withErrorHandler(mockFn)

      await expect(wrappedFn()).rejects.toThrow('Test error')
      
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockConsoleError).toHaveBeenCalled()
    })

    it('should pass arguments to the wrapped function', async () => {
      const mockFn = jest.fn().mockResolvedValue('success')
      const wrappedFn = withErrorHandler(mockFn)
      
      await wrappedFn('arg1', 'arg2', 'arg3')

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
    })
  })

  describe('AppError', () => {
    it('should create AppError with correct properties', () => {
      const error = new AppError(
        ErrorCode.UNAUTHORIZED,
        'Test error message',
        401,
        true
      )

      expect(error.code).toBe(ErrorCode.UNAUTHORIZED)
      expect(error.message).toBe('Test error message')
      expect(error.statusCode).toBe(401)
      expect(error.isOperational).toBe(true)
    })

    it('should use default values', () => {
      const error = new AppError(ErrorCode.INTERNAL_SERVER_ERROR, 'Test error')

      expect(error.statusCode).toBe(500)
      expect(error.isOperational).toBe(true)
    })
  })
})