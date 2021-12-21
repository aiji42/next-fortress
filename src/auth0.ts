import { Fallback } from './types'
import { NextRequest, NextMiddleware } from 'next/server'
import { handleFallback } from './handle-fallback'

export const makeAuth0Inspector = (
  fallback: Fallback,
  apiEndpoint: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customHandler?: (payload: any) => boolean
): NextMiddleware => {
  return async (request, event) => {
    const ok = await verifyAuth0Session(request, apiEndpoint, customHandler)
    if (ok) return
    return handleFallback(fallback, request, event)
  }
}

const verifyAuth0Session = async (
  req: NextRequest,
  apiEndpoint: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customHandler?: (payload: any) => boolean
): Promise<boolean> => {
  const res = await fetch(
    (/^\//.test(apiEndpoint) ? req.nextUrl.origin : '') + apiEndpoint,
    {
      headers: { cookie: req.headers.get('cookie') ?? '' }
    }
  )

  return !res.ok ? false : customHandler?.(await res.json()) ?? true
}
