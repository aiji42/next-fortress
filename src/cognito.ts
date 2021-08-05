import { GetServerSidePropsContext } from 'next'
import { withSSRContext } from 'aws-amplify'
import { Operator } from './types'

export const verifyCognitoAuthenticatedUser = async (
  ctx: GetServerSidePropsContext
): Promise<boolean> => {
  const { Auth } = withSSRContext(ctx)
  let authenticated: boolean
  try {
    const user = await Auth.currentAuthenticatedUser()
    authenticated = !!user
  } catch (_) {
    authenticated = false
  }

  return authenticated
}

export const cognito: Operator = async (fort, ctx) => {
  if (fort.inspectBy !== 'cognito') return false
  return verifyCognitoAuthenticatedUser(ctx)
}
