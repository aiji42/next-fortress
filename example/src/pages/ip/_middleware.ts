import { makeIPInspector } from 'next-fortress'
import { NextRequest, NextResponse } from 'next/server'

export const middleware = (req: NextRequest) => {
  const ips = req.cookies['__allowed_ips']
  if (!ips) return NextResponse.redirect('/ip')

  return makeIPInspector(ips.split(','), {
    type: 'redirect',
    destination: '/ip'
  })(req)
}
