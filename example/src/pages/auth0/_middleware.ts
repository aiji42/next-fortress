import { makeAuth0Inspector } from 'next-fortress/auth0'

export const middleware = makeAuth0Inspector(
  { type: 'redirect', destination: '/auth0' },
  '/api/auth/me'
)
