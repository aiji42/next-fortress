import { Fallback } from './types'
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'
import { NextMiddleware } from 'next/dist/server/web/types'

export const handleFallback = (
  fallback: Fallback,
  request: NextRequest,
  event: NextFetchEvent
): ReturnType<NextMiddleware> => {
  if (typeof fallback === 'function') return fallback(request, event)
  if (request.method === 'OPTIONS') return new NextResponse(null)
  if (fallback.type === 'rewrite') {
    const url = request.nextUrl.clone()
    url.pathname = fallback.destination
    return NextResponse.rewrite(url)
  }

  if (request.nextUrl.pathname !== fallback.destination) {
    const url = request.nextUrl.clone()
    url.pathname = fallback.destination
    return NextResponse.redirect(url, fallback.statusCode)
  }
}
