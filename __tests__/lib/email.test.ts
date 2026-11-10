describe('EmailService', () => {
  const originalApiKey = process.env.RESEND_API_KEY

  beforeEach(() => {
    jest.resetModules()
    delete process.env.RESEND_API_KEY
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  afterAll(() => {
    if (originalApiKey === undefined) {
      delete process.env.RESEND_API_KEY
    } else {
      process.env.RESEND_API_KEY = originalApiKey
    }
  })

  it('should be importable without RESEND_API_KEY', async () => {
    const { emailService } = await import('@/lib/email')

    expect(emailService).toBeDefined()
  })

  it('should return a configuration error instead of throwing when sending without RESEND_API_KEY', async () => {
    const { emailService } = await import('@/lib/email')

    const result = await emailService.sendEmail({
      to: 'user@example.com',
      subject: 'Test',
      html: '<p>Test</p>',
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('RESEND_API_KEY')
  })

  it('should not crash when building a magic link email without RESEND_API_KEY', async () => {
    const { emailService } = await import('@/lib/email')

    const html = emailService.generateMagicLinkEmail({
      url: 'https://example.com/api/auth/callback/email?token=test',
      email: 'user@example.com',
      locale: 'zh',
    })

    expect(html).toContain('登录到 SnapHere')
  })
})
