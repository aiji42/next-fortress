import { makeAuth0Inspector } from 'next-fortress'
import { NextRequest } from 'next/server'

export const middleware = async (req: NextRequest) => {
  if (!req.nextUrl.pathname.includes('authed')) return

  return makeAuth0Inspector(
    { type: 'redirect', destination: '/auth0' },
    req.nextUrl.origin + '/api/auth/me'
  )(req)
}
