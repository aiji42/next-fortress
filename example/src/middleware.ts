import { makeAuth0Inspector } from 'next-fortress/auth0'
import { NextMiddleware, NextResponse } from 'next/server'
import { makeCognitoInspector } from 'next-fortress/cognito'
import { makeFirebaseInspector } from 'next-fortress/firebase'
import { makeIPInspector } from 'next-fortress/ip'

export const middleware: NextMiddleware = async (request, event) => {
  if (request.nextUrl.pathname.startsWith('/auth0')) {
    return makeAuth0Inspector(
      { type: 'redirect', destination: '/auth0' },
      '/api/auth/me'
    )(request, event)
  }

  if (request.nextUrl.pathname.startsWith('/cognito')) {
    const region = process.env.NEXT_PUBLIC_COGNITO_REGION ?? ''
    const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? ''
    const userPoolWebClientId =
      process.env.NEXT_PUBLIC_COGNITO_USER_POOL_WEB_CLIENT_ID ?? ''
    return makeCognitoInspector(
      { type: 'redirect', destination: '/cognito' },
      { region, userPoolId, userPoolWebClientId }
    )(request, event)
  }

  if (request.nextUrl.pathname.startsWith('/firebase')) {
    return makeFirebaseInspector(
      {
        type: 'redirect',
        destination: '/firebase'
      },
      (res) => res.firebase.sign_in_provider !== 'anonymous'
    )(request, event)
  }

  if (request.nextUrl.pathname.startsWith('/ip')) {
    if (!request.nextUrl.pathname.includes('admin')) return
    const ips = request.cookies.get('__allowed_ips')
    if (!ips) {
      if (request.method === 'OPTIONS') return new NextResponse(null)
      const url = request.nextUrl.clone()
      url.pathname = '/ip'
      return NextResponse.redirect(url)
    }

    return makeIPInspector(ips.split(','), {
      type: 'redirect',
      destination: '/ip'
    })(request, event)
  }
}
