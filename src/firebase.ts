import * as firebaseAdmin from 'firebase-admin'
import { GetServerSidePropsContext } from 'next'
import nookies from 'nookies'
import getConfig from 'next/config'
import { FortressFirebaseCredential, Operator } from './types'
import { FIREBASE_COOKIE_KEY } from './constants'

const { serverRuntimeConfig } = getConfig()

if (!firebaseAdmin.apps.length && serverRuntimeConfig.fortress?.firebase) {
  const { clientEmail, projectId, privateKey }: FortressFirebaseCredential =
    serverRuntimeConfig.fortress.firebase
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
      clientEmail,
      projectId,
      privateKey: privateKey.replace(/\\n/g, '\n')
    })
  })
}

export const verifyFirebaseIdToken = async (
  ctx: GetServerSidePropsContext
): Promise<boolean> => {
  const cookies = nookies.get(ctx)
  const token = cookies[FIREBASE_COOKIE_KEY]
  if (!token) return false
  return firebaseAdmin
    .auth()
    .verifyIdToken(token)
    .then(() => true)
    .catch(() => false)
}

export const firebase: Operator = async (fort, ctx) => {
  if (fort.inspectBy !== 'firebase') return false
  return verifyFirebaseIdToken(ctx)
}
