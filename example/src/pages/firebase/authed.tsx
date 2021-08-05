import { Logout, auth } from '../../lib/firebase'
import styles from '../../styles/Home.module.css'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, VFC } from 'react'
import Prism from 'prismjs'

const Authed: VFC = () => {
  useEffect(() => {
    Prism.highlightAll()
  }, [])
  return (
    <div className={styles.container}>
      <Head>
        <title>My Page | Firebase Example | Next Fortress</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Next Fortress</h1>
        <h2>My Page</h2>

        <p>
          <strong>Hi! {auth.currentUser?.displayName}</strong>
        </p>
        <p>This page is accessible only to logged-in users.</p>

        <div className={styles.grid}>
          <button className={styles.card} onClick={() => Logout()}>
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
      inspectBy: 'firebase',
      mode: 'redirect',
      source: '/firebase/:path',
      destination: '/firebase'
    }
  ],
  firebase: {
    clientEmail: 'your client emai',
    projectId: 'your project id',
    privateKey: 'your private key'
  }
})
module.exports = withFortress({})
`}
          </code>
        </pre>

        <pre style={{ maxWidth: 800, width: '100%' }}>
          <code className="language-javascript">
            {`//pages/_app.tsx
import { useFortressWithFirebase } from 'next-fortress/build/client'
import firebase from 'firebase/app'

function MyApp({ Component, pageProps }: AppProps) {
  useFortressWithFirebase(firebase)

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
