import { Fallback } from './types'
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'
import { NextMiddleware } from 'next/dist/server/web/types'

export const handleFallback = (
  fallback: Fallback,
  request: NextRequest,
  event: NextFetchEvent
): ReturnType<NextMiddleware> => {
  if (typeof fallback === 'function') return fallback(request, event)
  if (request.preflight) return new NextResponse(null)
  if (fallback.type === 'rewrite')
    return NextResponse.rewrite(fallback.destination)

  if (request.nextUrl.pathname !== fallback.destination)
    return NextResponse.redirect(fallback.destination, fallback.statusCode)
}
