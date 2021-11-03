import { makeAuth0Inspector } from 'next-fortress/build/auth0'
import { NextRequest } from 'next/server'

export const middleware = (req: NextRequest) => {
  if (req.nextUrl.pathname === '/auth0/authed')
    return makeAuth0Inspector({ type: 'redirect', destination: '/cognito' })(
      req
    )
}
