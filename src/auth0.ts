import { GetServerSidePropsContext } from 'next'
import { getSession } from '@auth0/nextjs-auth0'
import { Operator } from './types'

export const verifyAuth0Session = async (
  ctx: GetServerSidePropsContext
): Promise<boolean> => {
  const { req, res } = ctx
  const session = await getSession(req, res)

  return !!session
}

export const auth0: Operator = async (fort, ctx) => {
  if (fort.inspectBy !== 'auth0') return false
  return verifyAuth0Session(ctx)
}
