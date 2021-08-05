import styles from '../../styles/Home.module.css'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState, VFC } from 'react'
import Prism from 'prismjs'
import { Auth } from 'aws-amplify'

const Authed: VFC = () => {
  const [session, setSession] = useState<undefined | { username: string }>()
  useEffect(() => {
    Prism.highlightAll()
    Auth.currentAuthenticatedUser()
      .then(setSession)
      .catch(() => setSession(undefined))
  }, [])
  return (
    <div className={styles.container}>
      <Head>
        <title>My Page | Cognito Example | Next Fortress</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Next Fortress</h1>
        <h2>My Page</h2>

        <p>
          <strong>Hi! {session?.username}</strong>
        </p>
        <p>This page is accessible only to logged-in users.</p>

        <div className={styles.grid}>
          <button className={styles.card} onClick={() => Auth.signOut()}>
            <h2>Logout</h2>
            <p>You will be redirected to the page you were on.</p>
          </button>
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
module.exports = withFortress({})
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

export default Authed
