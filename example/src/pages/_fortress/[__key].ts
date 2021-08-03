import {GetServerSideProps, GetServerSidePropsContext} from 'next'
import { getServerSideProps as _getServerSideProps } from 'next-fortress/build/inspect'
import { withSSRContext } from 'aws-amplify'

export const verifyCognitoAuthenticatedUser = async (
  ctx: GetServerSidePropsContext
): Promise<boolean> => {
  const { Auth } = withSSRContext(ctx)
  console.log(ctx.req.cookies)
  let authenticated: boolean
  try {
    const user = await Auth.currentAuthenticatedUser()
    authenticated = !!user
  } catch (e) {
    console.log(e)
    authenticated = false
  }

  return authenticated
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  await verifyCognitoAuthenticatedUser(ctx)
  return await _getServerSideProps(ctx)
}

const Inspect = () => null

export default Inspect
