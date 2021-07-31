import * as firebaseAdmin from 'firebase-admin'

const firebasePrivateKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? ''

if (!firebasePrivateKey) console.error('権限がありません')

if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? 'aiji42@gmail.com',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      privateKey: firebasePrivateKey.replace(/\\n/g, '\n') // 参照: https://stackoverflow.com/a/41044630/1332513
    })
  })
}

export const verifyIdToken = async (
  token: string
): Promise<firebaseAdmin.auth.DecodedIdToken> => {
  return firebaseAdmin
    .auth()
    .verifyIdToken(token)
    .catch((error) => {
      console.error(error)

      throw new Error('有効なトークンではありません')
    })
}
