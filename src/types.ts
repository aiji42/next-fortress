import { NextMiddleware } from 'next/server'

export type Fallback =
  | NextMiddleware
  | { type: 'rewrite'; destination: string }
  | {
      type: 'redirect'
      destination: string
      statusCode?: 301 | 302 | 303 | 307 | 308
    }
