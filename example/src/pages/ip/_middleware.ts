import { makeIPInspector } from 'next-fortress'
import { NextRequest } from 'next/server'

export const middleware = (req: NextRequest) => {
  return makeIPInspector('14.11.11.224/32', {
    type: 'redirect',
    destination: '/'
  })(req)
}
