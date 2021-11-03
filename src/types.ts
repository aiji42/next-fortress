import { NextRequest, NextFetchEvent } from 'next/server'

export type Middleware = (
  request: NextRequest,
  event?: NextFetchEvent
) => Response | undefined

export type AsyncMiddleware = (
  request: NextRequest,
  event?: NextFetchEvent
) => Promise<Response | undefined>

export type Fallback =
  | Middleware
  | { type: 'rewrite'; destination: string }
  | {
      type: 'redirect'
      destination: string
      statusCode?: 301 | 302 | 303 | 307 | 308
    }
