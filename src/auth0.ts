// import { getSession } from '@auth0/nextjs-auth0'
import { AsyncMiddleware, Fallback } from './types'
import { NextRequest } from 'next/server'
import { handleFallback } from './handle-fallback'

export const makeAuth0Inspector = (fallback: Fallback): AsyncMiddleware => {
  return async (request, event) => {
    const ok = await verifyAuth0Session(request)
    if (ok) return
    return handleFallback(fallback, request, event)
  }
}

const verifyAuth0Session = async (req: NextRequest): Promise<boolean> => {
  // const session = await getSession(req, res)
  //
  // return !!session
  return !req
}
