import firebase from 'firebase/app'
import { useEffect } from 'react'
import { FIREBASE_COOKIE_KEY } from './constants'

export const fortressWithFirebase = (fb: typeof firebase): void => {
  fb.auth().onAuthStateChanged((user) => {
    if (user)
      user
        .getIdToken()
        .then(
          (token) =>
            (document.cookie = `${FIREBASE_COOKIE_KEY}=${token}; path=/`)
        )
    else
      document.cookie = `${FIREBASE_COOKIE_KEY}=; path=/; expires=${new Date(
        '1999-12-31T23:59:59Z'
      ).toUTCString()}`
  })
}

export const useFortressWithFirebase = (fb: typeof firebase): void => {
  useEffect(() => {
    fortressWithFirebase(fb)
  }, [fb])
}
