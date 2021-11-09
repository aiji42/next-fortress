import { AsyncMiddleware, Fallback } from './types'
import { NextRequest } from 'next/server'
import { handleFallback } from './handle-fallback'

export const makeAuth0Inspector = (
  fallback: Fallback,
  apiEndpoint: string
): AsyncMiddleware => {
  return async (request, event) => {
    const ok = await verifyAuth0Session(request, apiEndpoint)
    if (ok) return
    return handleFallback(fallback, request, event)
  }
}

const verifyAuth0Session = async (
  req: NextRequest,
  apiEndpoint: string
): Promise<boolean> => {
  const res = await fetch(
    (/^\//.test(apiEndpoint) ? req.nextUrl.origin : '') + apiEndpoint,
    {
      headers: { cookie: req.headers.get('cookie') ?? '' }
    }
  )

  return res.ok
}
