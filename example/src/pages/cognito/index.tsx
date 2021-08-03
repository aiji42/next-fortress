import styles from '../../styles/Home.module.css'
import Head from 'next/head'
import Image from 'next/image'
import Prism from 'prismjs'
import { useEffect, useState, VFC } from 'react'
import { Auth } from 'aws-amplify'

const IndexPage: VFC = () => {
  const [login, setLogin] = useState(false)
  useEffect(() => {
    Prism.highlightAll()
    Auth.currentAuthenticatedUser()
      .then(() => setLogin(true))
      .catch(() => setLogin(false))
  }, [])
  return (
    <div className={styles.container}>
      <Head>
        <title>Cognito Example | Next Fortress</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Next Fortress</h1>
        <h2>Cognito example</h2>

        <p>This page can be accessed by anyone, with or without a login.</p>
        <p>My Page can be accessed only when you are logged in.</p>

        <div className={styles.grid}>
          {!login ? (
            <button
              className={styles.card}
              onClick={() => Auth.federatedSignIn()}
            >
              <h2>Login</h2>
              <p>You are Not logged in.</p>
            </button>
          ) : (
            <button className={styles.card} onClick={() => Auth.signOut()}>
              <h2>Logout</h2>
              <p>You are logged in.</p>
            </button>
          )}

          <a href="/cognito/authed" className={styles.card}>
            <h2>Go My Page &rarr;</h2>
            <p>Try it!</p>
          </a>
        </div>

        <hr />
        <p>This concise code brings access control to this page.</p>
        <pre style={{ maxWidth: 800, width: '100%' }}>
          <code className="language-javascript">
            {`//next.config.js
const withFortress = require('next-fortress')({
  forts: [
    {
      inspectBy: 'cognito',
      mode: 'redirect',
      source: '/cognito/:path',
      destination: '/cognito'
    }
  ]
})
module.export = withFortress({})
`}
          </code>
        </pre>

        <pre style={{ maxWidth: 800, width: '100%' }}>
          <code className="language-javascript">
            {`//pages/_app.tsx
import Amplify from 'aws-amplify'

Amplify.configure({
  // ..., your configure
  ssr: true
})

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
`}
          </code>
        </pre>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}

export default IndexPage
