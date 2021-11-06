import type { AppProps } from 'next/app'
import AuthContext from '../lib/AuthContext'
import authReducer from '../lib/authReducer'
import { listenAuthState } from '../lib/firebase'
import { useEffect, useReducer } from 'react'
import '../styles/globals.css'
import Amplify from 'aws-amplify'
import { UserProvider } from '@auth0/nextjs-auth0'
import {
  GeistProvider,
  CssBaseline,
  Page,
  Text,
  Link,
  Grid
} from '@geist-ui/react'
import Image from 'next/image'
import Github from '@geist-ui/react-icons/github'

Amplify.configure({
  aws_cognito_identity_pool_id:
    process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID,
  aws_cognito_region: process.env.NEXT_PUBLIC_COGNITO_REGION,
  aws_user_pools_id: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
  aws_user_pools_web_client_id:
    process.env.NEXT_PUBLIC_COGNITO_USER_POOL_WEB_CLIENT_ID,
  oauth: {
    domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
    scope: ['openid', 'profile', 'email'],
    redirectSignIn:
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
        ? 'https://next-fortress.vercel.app/cognito'
        : process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/cognito`
        : 'http://localhost:3000/cognito',
    redirectSignOut:
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
        ? 'https://next-fortress.vercel.app/cognito'
        : process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/cognito`
        : 'http://localhost:3000/cognito',
    responseType: 'code'
  },
  ssr: true
})

function MyApp({ Component, pageProps }: AppProps) {
  const [state, dispatch] = useReducer(
    authReducer.reducer,
    authReducer.initialState
  )
  useEffect(() => {
    listenAuthState(dispatch)
  }, [])

  return (
    <UserProvider>
      <AuthContext.Provider value={state}>
        <GeistProvider>
          <CssBaseline />
          <Page width="800px" padding={0}>
            <Page.Header>
              <Grid.Container gap={2} justify="space-between">
                <Grid xs={18}>
                  <Text h1 font="32px" paddingLeft={1} paddingTop={1}>
                    <Link href="/">🏯 Next Fortress</Link>
                  </Text>
                </Grid>
                <Grid>
                  <Text font="32px" marginTop={1.3} paddingRight={2}>
                    <Link
                      href="https://github.com/aiji42/next-fortress"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github size={32} />
                    </Link>
                  </Text>
                </Grid>
              </Grid.Container>
            </Page.Header>

            <Page.Content padding={1} paddingTop={0}>
              <Component {...pageProps} />
            </Page.Content>

            <Page.Footer>
              <Grid.Container justify="center">
                <Grid xs={24} height="50px">
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <a
                      href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'black' }}
                    >
                      Powered by{' '}
                      <Image
                        src="/vercel.svg"
                        alt="Vercel Logo"
                        width={72}
                        height={16}
                      />
                    </a>
                  </div>
                </Grid>
              </Grid.Container>
            </Page.Footer>
          </Page>
        </GeistProvider>
      </AuthContext.Provider>
    </UserProvider>
  )
}
export default MyApp
