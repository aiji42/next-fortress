// import { makeFirebaseInspector } from 'next-fortress/build/firebase'
// import { FIREBASE_COOKIE_KEY } from 'next-fortress/build/constants'
import { NextRequest, NextResponse } from 'next/server'
import { verify, decode } from 'jsonwebtoken'

const FIREBASE_COOKIE_KEY = '__fortressFirebaseSession'

let cache: {
  expire: null | Date
  keys: Record<string, string>
} = { expire: null, keys: {} }

export const middleware = async (req: NextRequest) => {
  if (!req.nextUrl.pathname.includes('authed')) return

  const token = req.cookies[FIREBASE_COOKIE_KEY] ?? ''
  if (!token) return NextResponse.redirect('/firebase')

  if (!cache.expire || new Date() > cache.expire || !Object.keys(cache.keys)) {
    cache.keys = await fetch(
      'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
    ).then((res) => {
      cache.expire = new Date(res.headers.get('expires') ?? '')
      return res.json()
    })
  } else {
    console.log(`You have public key cache. Expire: ${cache.expire}`)
  }

  const kid = decode(token, { complete: true })?.header.kid ?? ''
  try {
    verify(token, cache.keys[kid])
  } catch (_) {
    return NextResponse.redirect('/firebase')
  }
}
