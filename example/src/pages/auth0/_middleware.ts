import { makeAuth0Inspector } from 'next-fortress'

export const middleware = makeAuth0Inspector(
  { type: 'redirect', destination: '/auth0' },
  '/api/auth/me'
)
