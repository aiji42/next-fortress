// import { makeFirebaseInspector } from 'next-fortress/build/firebase'
// import { FIREBASE_COOKIE_KEY } from 'next-fortress/build/constants'
import { NextRequest, NextResponse } from 'next/server'
import { decodeProtectedHeader, jwtVerify, JWK, importJWK } from 'jose'

const FIREBASE_COOKIE_KEY = '__fortressFirebaseSession'

let cache: {
  expire: null | Date
  keys: JWK[]
} = { expire: null, keys: [] }

export const middleware = async (req: NextRequest) => {
  if (!req.nextUrl.pathname.includes('authed')) return

  const token = req.cookies[FIREBASE_COOKIE_KEY] ?? ''
  if (!token) return NextResponse.redirect('/firebase')

  if (!cache.expire || new Date() > cache.expire || !Object.keys(cache.keys)) {
    cache.keys = (
      await fetch(
        'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
      ).then((res) => {
        cache.expire = new Date(res.headers.get('expires') ?? '')
        return res.json()
      })
    ).keys
  } else {
    console.log(`You have public key cache. Expire: ${cache.expire}`)
  }

  const kid = decodeProtectedHeader(token).kid ?? ''
  const jwk = cache.keys.find((key) => key.kid === kid)
  if (!jwk) return NextResponse.redirect('/firebase')
  try {
    await jwtVerify(token, await importJWK(jwk))
  } catch (_) {
    return NextResponse.redirect('/firebase')
  }
}
