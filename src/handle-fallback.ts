import { Fallback, Middleware } from './types'
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'

export const handleFallback = (
  fallback: Fallback,
  request: NextRequest,
  event?: NextFetchEvent
): ReturnType<Middleware> => {
  if (typeof fallback === 'function') return fallback(request, event)
  if (fallback.type === 'rewrite')
    return NextResponse.rewrite(fallback.destination)

  if (request.nextUrl.pathname !== fallback.destination)
    return NextResponse.redirect(fallback.destination, fallback.statusCode)
}
