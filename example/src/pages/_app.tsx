import '../styles/globals.css'
import type { AppProps } from 'next/app'
import AuthContext from '../lib/AuthContext'
import authReducer from '../lib/authReducer'
import { listenAuthState } from '../lib/firebase'
import { useEffect, useReducer } from 'react'
import { useFortressWithFirebase } from 'next-fortress/build/client'
import firebase from 'firebase/app'
import 'prismjs/themes/prism-tomorrow.css'

function MyApp({ Component, pageProps }: AppProps) {
  useFortressWithFirebase(firebase)
  const [state, dispatch] = useReducer(
    authReducer.reducer,
    authReducer.initialState
  )
  useEffect(() => {
    listenAuthState(dispatch)
  }, [])

  return (
    <AuthContext.Provider value={state}>
      <Component {...pageProps} />
    </AuthContext.Provider>
  )
}
export default MyApp
