import { makeCognitoInspector } from 'next-fortress'
import { NextRequest } from 'next/server'

const region = process.env.NEXT_PUBLIC_COGNITO_REGION ?? ''
const poolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? ''

export const middleware = async (req: NextRequest) => {
  if (!req.nextUrl.pathname.includes('authed')) return

  return makeCognitoInspector(
    { type: 'redirect', destination: '/cognito' },
    region,
    poolId
  )(req)
}
