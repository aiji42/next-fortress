import { Fallback } from './types'
import { FIREBASE_COOKIE_KEY } from './constants'
import { NextRequest, NextMiddleware, NextFetchEvent } from 'next/server'
import { handleFallback } from './handle-fallback'
import { decodeProtectedHeader, jwtVerify, importX509 } from 'jose'

export const makeFirebaseInspector = (
  fallback: Fallback,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customHandler?: (payload: any) => boolean
): NextMiddleware => {
  return async (request, event) => {
    const ok = await verifyFirebaseIdToken(request, event, customHandler)
    if (ok) return
    return handleFallback(fallback, request, event)
  }
}

const verifyFirebaseIdToken = async (
  req: NextRequest,
  event: NextFetchEvent,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customHandler?: (payload: any) => boolean
): Promise<boolean> => {
  const cookieKey =
    process.env.FORTRESS_FIREBASE_COOKIE_KEY ?? FIREBASE_COOKIE_KEY
  const token = req.cookies.get(cookieKey)
  if (!token) return false

  const endpoint = new URL(
    process.env.FORTRESS_FIREBASE_MODE === 'session'
      ? 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/publicKeys'
      : 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
  )
  const cache = await caches.open('cache:firebase')
  let jwkRes = await cache.match(endpoint)
  if (!jwkRes) {
    console.log('cache not hit')
    jwkRes = await fetch(endpoint)
    event.waitUntil(cache.put(endpoint, jwkRes.clone()))
  } else {
    console.log('cache hit')
  }

  try {
    const keys: Record<string, string> = await jwkRes.json()
    const { kid = '' } = decodeProtectedHeader(token)

    return jwtVerify(token, await importX509(keys[kid], 'RS256'))
      .then((res) => customHandler?.(res.payload) ?? true)
      .catch(() => false)
  } catch (_) {
    return false
  }
}
