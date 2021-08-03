import { GetServerSidePropsContext } from 'next'
import { withSSRContext } from 'aws-amplify'

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
