import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 仅在开发环境统一域名，避免影响生产环境
  const isDev = process.env.NODE_ENV !== 'production'
  if (!isDev) {
    return NextResponse.next()
  }

  // 开发环境开关：禁用主机名强制重定向（用于端口变更或占用的情况）
  const disableEnforce = process.env.DISABLE_DEV_HOST_ENFORCE === 'true'
  if (disableEnforce) {
    return NextResponse.next()
  }

  const url = new URL(request.url)
  const host = request.headers.get('host') ?? url.host

  // 期望的主机名取自 NEXTAUTH_URL（例如 localhost:3000）
  const nextauthUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const expected = new URL(nextauthUrl)
  const expectedHost = expected.host
  const expectedProtocol = expected.protocol

  // 主机不一致则重定向到期望主机，保留路径与查询（使用 307 保留方法）
  if (host !== expectedHost) {
    url.host = expectedHost
    url.protocol = expectedProtocol
    return NextResponse.redirect(url, 307)
  }

  return NextResponse.next()
}

export const config = {
  // 包含 /api/auth/callback 路径，修复第三方返回到 127.0.0.1 导致的状态/CSRF 校验失败
  matcher: [
    '/api/auth/callback/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}