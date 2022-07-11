import { makeIPInspector } from 'next-fortress/ip'
import { NextMiddleware, NextResponse } from 'next/server'

export const middleware: NextMiddleware = (req, event) => {
  if (!req.nextUrl.pathname.includes('admin')) return
  const ips = req.cookies['__allowed_ips']
  if (!ips) {
    if (req.preflight) return new NextResponse(null)
    const url = req.nextUrl.clone()
    url.pathname = '/ip'
    return NextResponse.redirect(url)
  }

  return makeIPInspector(ips.split(','), {
    type: 'redirect',
    destination: '/ip'
  })(req, event)
}
