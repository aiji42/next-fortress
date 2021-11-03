import { withSSRContext } from 'aws-amplify'
import { AsyncMiddleware, Fallback } from './types'
import { NextRequest } from 'next/server'
import { handleFallback } from './handle-fallback'

export const makeCognitoInspector = (fallback: Fallback): AsyncMiddleware => {
  return async (request, event) => {
    const ok = await verifyCognitoAuthenticatedUser(request)
    if (ok) return
    return handleFallback(fallback, request, event)
  }
}

const verifyCognitoAuthenticatedUser = async (
  req: NextRequest
): Promise<boolean> => {
  const { Auth } = withSSRContext({
    req: { headers: { cookie: req.headers.get('cookie') } }
  })
  let authenticated: boolean
  try {
    const user = await Auth.currentAuthenticatedUser()
    authenticated = !!user
  } catch (_) {
    authenticated = false
  }

  return authenticated
}
