import * as firebaseAdmin from 'firebase-admin'

const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY

if (!firebasePrivateKey) console.error('権限がありません')

if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      privateKey: firebasePrivateKey?.replace(/\\n/g, '\n')
    })
  })
}

export const verifyIdToken = async (
  token: string | undefined | null
): Promise<boolean> => {
  if (!token) return false
  return firebaseAdmin
    .auth()
    .verifyIdToken(token)
    .then(() => true)
    .catch(() => false)
}
