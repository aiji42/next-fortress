import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  signInAnonymously
} from 'firebase/auth'

export const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

const firebaseApp = initializeApp(config)

export const auth = getAuth(firebaseApp)

export const login = () => {
  const provider = new GoogleAuthProvider()
  signInWithPopup(auth, provider)
    .then((result) => {
      return result
    })
    .catch(function (error) {
      console.log(error)
      const errorCode = error.code
      console.log(errorCode)
      const errorMessage = error.message
      console.log(errorMessage)
    })
}

export const listenAuthState = (dispatch: any) => {
  return onAuthStateChanged(auth, async function (user) {
    if (user) {
      // User is signed in.
      const id = await user.getIdToken()
      await fetch('/api/firebase/login', {
        method: 'POST',
        body: JSON.stringify({ id })
      })
      dispatch({
        type: 'login',
        payload: {
          user
        }
      })
    } else {
      // User is signed out.
      await fetch('/api/firebase/logout', {
        method: 'POST'
      })
      await signInAnonymously(auth)
      dispatch({
        type: 'logout'
      })
    }
  })
}

export const firebaseUser = () => {
  return auth.currentUser
}

export const logout = () => {
  signOut(auth).then(() => {
    window.location.reload()
  })
}
