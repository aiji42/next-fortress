import { Fallback } from './types'
import { FIREBASE_COOKIE_KEY } from './constants'
import { NextRequest, NextMiddleware } from 'next/server'
import { handleFallback } from './handle-fallback'
import { decodeProtectedHeader, jwtVerify, importX509 } from 'jose'

export const makeFirebaseInspector = (
  fallback: Fallback,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customHandler?: (payload: any) => boolean
): NextMiddleware => {
  return async (request, event) => {
    const ok = await verifyFirebaseIdToken(request, customHandler)
    if (ok) return
    return handleFallback(fallback, request, event)
  }
}

const verifyFirebaseIdToken = async (
  req: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customHandler?: (payload: any) => boolean
): Promise<boolean> => {
  const cookieKey =
    process.env.FORTRESS_FIREBASE_COOKIE_KEY ?? FIREBASE_COOKIE_KEY
  const token = req.cookies[cookieKey]
  if (!token) return false

  const endpoint =
    process.env.FORTRESS_FIREBASE_MODE === 'session'
      ? 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/publicKeys'
      : 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'

  try {
    const keys: Record<string, string> = await fetch(endpoint).then((res) =>
      res.json()
    )
    const { kid = '' } = decodeProtectedHeader(token)

    return jwtVerify(token, await importX509(keys[kid], 'RS256'))
      .then((res) => customHandler?.(res.payload) ?? true)
      .catch(() => false)
  } catch (_) {
    return false
  }
}
