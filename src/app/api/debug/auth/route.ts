import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const baseUrl = `${url.protocol}//${url.host}`
  
  return NextResponse.json({
    requestUrl: request.url,
    baseUrl: baseUrl,
    host: request.headers.get('host'),
    protocol: url.protocol,
    origin: url.origin,
    nextauthUrl: process.env.NEXTAUTH_URL,
    nodeEnv: process.env.NODE_ENV,
    headers: Object.fromEntries(request.headers.entries())
  })
}