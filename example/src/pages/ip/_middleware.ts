import { makeIPInspector } from 'next-fortress'
import { NextMiddleware, NextResponse } from 'next/server'

export const middleware: NextMiddleware = (req, event) => {
  if (!req.nextUrl.pathname.includes('admin')) return
  const ips = req.cookies['__allowed_ips']
  if (!ips) {
    if (req.preflight) return new NextResponse(null)
    return NextResponse.redirect('/ip')
  }

  return makeIPInspector(ips.split(','), {
    type: 'redirect',
    destination: '/ip'
  })(req, event)
}
