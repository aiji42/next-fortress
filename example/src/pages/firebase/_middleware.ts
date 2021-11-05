import { makeFirebaseInspector } from 'next-fortress'
import { NextRequest } from 'next/server'

export const middleware = async (req: NextRequest) => {
  if (!req.nextUrl.pathname.includes('authed')) return

  return makeFirebaseInspector({ type: 'redirect', destination: '/firebase' })(
    req
  )
}
