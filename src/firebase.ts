import { AsyncMiddleware, Fallback } from './types'
import { FIREBASE_COOKIE_KEY } from './constants'
import { NextRequest } from 'next/server'
import { handleFallback } from './handle-fallback'
import { decodeProtectedHeader, jwtVerify, JWK, importJWK } from 'jose'

export const makeFirebaseInspector = (fallback: Fallback): AsyncMiddleware => {
  return async (request, event) => {
    const ok = await verifyFirebaseIdToken(request)
    if (ok) return
    return handleFallback(fallback, request, event)
  }
}

const JWK_ENDPOINT =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'

const verifyFirebaseIdToken = async (req: NextRequest): Promise<boolean> => {
  const token = req.cookies[FIREBASE_COOKIE_KEY]
  if (!token) return false

  const { keys }: { keys: JWK[] } = await fetch(JWK_ENDPOINT).then((res) =>
    res.json()
  )

  const { kid } = decodeProtectedHeader(token)
  const jwk = keys.find((key) => key.kid === kid)
  if (!jwk) return false

  return jwtVerify(token, await importJWK(jwk))
    .then(() => true)
    .catch(() => false)
}
