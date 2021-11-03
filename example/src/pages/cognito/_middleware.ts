import { makeCognitoInspector } from 'next-fortress/build/cognito'
import { NextRequest } from 'next/server'

export const middleware = (req: NextRequest) => {
  if (req.nextUrl.pathname === '/cognito/authed')
    return makeCognitoInspector({ type: 'redirect', destination: '/cognito' })(
      req
    )
}
