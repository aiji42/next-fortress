import '../styles/globals.css'
import type { AppProps } from 'next/app'
import AuthContext from '../lib/AuthContext'
import authReducer from '../lib/authReducer'
import { listenAuthState, fortressWithFirebase } from '../lib/firebase'
import { useEffect, useReducer } from 'react'

function MyApp({ Component, pageProps }: AppProps) {
  const [state, dispatch] = useReducer(
    authReducer.reducer,
    authReducer.initialState
  )
  useEffect(() => {
    listenAuthState(dispatch)
    fortressWithFirebase()
  }, [])

  return (
    <AuthContext.Provider value={state}>
      <Component {...pageProps} />
    </AuthContext.Provider>
  )
}
export default MyApp
