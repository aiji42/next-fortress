import { Auth } from 'firebase-admin/lib/auth'
import { AsyncMiddleware, Fallback } from './types'
import { FIREBASE_COOKIE_KEY } from './constants'
import { NextRequest } from 'next/server'
import { handleFallback } from './handle-fallback'

export const makeFirebaseInspector = (
  auth: Auth,
  fallback: Fallback
): AsyncMiddleware => {
  return async (request, event) => {
    const ok = await verifyFirebaseIdToken(auth, request)
    if (ok) return
    return handleFallback(fallback, request, event)
  }
}

const verifyFirebaseIdToken = async (
  auth: Auth,
  req: NextRequest
): Promise<boolean> => {
  const token = req.cookies[FIREBASE_COOKIE_KEY]
  if (!token) return false
  return auth
    .verifyIdToken(token, true)
    .then(() => true)
    .catch(() => false)
}
