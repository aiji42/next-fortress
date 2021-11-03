import { makeFirebaseInspector } from 'next-fortress/build/firebase'
import { NextRequest } from 'next/server'
import * as firebaseAdmin from 'firebase-admin'

if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  })
}

export const middleware = (req: NextRequest) => {
  if (req.nextUrl.pathname === '/firebase/authed')
    return makeFirebaseInspector(firebaseAdmin.auth(), {
      type: 'redirect',
      destination: '/firebase'
    })(req)
}
