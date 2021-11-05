// import { makeAuth0Inspector } from 'next-fortress/build/auth0'
import { NextRequest, NextResponse } from 'next/server'

export const middleware = async (req: NextRequest) => {
  if (req.nextUrl.pathname !== '/auth0/authed') return

  const res = await fetch('/api/auth/me', {
    headers: { cookie: req.headers.get('cookie') ?? '' }
  })

  if (!res.ok) return NextResponse.redirect('/auth0')
}
