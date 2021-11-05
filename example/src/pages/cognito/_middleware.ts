// import { makeFirebaseInspector } from 'next-fortress/build/firebase'
import { NextRequest, NextResponse } from 'next/server'
import { decodeProtectedHeader, jwtVerify, importJWK, JWK } from 'jose'

const region = process.env.NEXT_PUBLIC_COGNITO_REGION
const poolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID

let cache: {
  keys: JWK[]
} = { keys: [] }

export const middleware = async (req: NextRequest) => {
  if (!req.nextUrl.pathname.includes('authed')) return

  const token = Object.entries(req.cookies).find(([key]) =>
    /CognitoIdentityServiceProvider\..+\.idToken/.test(key)
  )?.[1]
  if (!token) return NextResponse.redirect('/cognito')

  if (!cache.keys.length) {
    cache.keys = (
      await fetch(
        `https://cognito-idp.${region}.amazonaws.com/${poolId}/.well-known/jwks.json`
      ).then((res) => {
        return res.json()
      })
    ).keys
  } else {
    console.log(`You have public key cache.`)
  }

  const kid = decodeProtectedHeader(token).kid ?? ''
  const jwk = cache.keys.find((key) => key.kid === kid)
  if (!jwk) return NextResponse.redirect('/cognito')

  try {
    await jwtVerify(token, await importJWK(jwk))
  } catch (_) {
    return NextResponse.redirect('/cognito')
  }
}
