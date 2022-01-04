import { Fallback } from './types'
import { NextRequest, NextMiddleware } from 'next/server'
import { handleFallback } from './handle-fallback'
import { decodeProtectedHeader, importJWK, JWK, jwtVerify } from 'jose'

type UserPoolParams = {
  region: string
  userPoolId: string
  userPoolWebClientId: string
}

export const makeCognitoInspector = (
  fallback: Fallback,
  params: UserPoolParams,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customHandler?: (payload: any) => boolean
): NextMiddleware => {
  return async (request, event) => {
    const ok = await verifyCognitoAuthenticatedUser(
      request,
      params,
      customHandler
    )
    if (ok) return
    return handleFallback(fallback, request, event)
  }
}

const verifyCognitoAuthenticatedUser = async (
  req: NextRequest,
  { region, userPoolId: poolId, userPoolWebClientId: clientId }: UserPoolParams,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customHandler?: (payload: any) => boolean
): Promise<boolean> => {
  const token = Object.entries(req.cookies).find(([key]) =>
    new RegExp(
      `CognitoIdentityServiceProvider\\.${clientId}\\..+\\.idToken`
    ).test(key)
  )?.[1]
  if (!token) return false

  const { keys }: { keys: JWK[] } = await fetch(
    `https://cognito-idp.${region}.amazonaws.com/${poolId}/.well-known/jwks.json`
  ).then((res) => res.json())

  const { kid } = decodeProtectedHeader(token)
  const jwk = keys.find((key) => key.kid === kid)
  if (!jwk) return false

  return jwtVerify(token, await importJWK(jwk))
    .then((res) => customHandler?.(res.payload) ?? true)
    .catch(() => false)
}
