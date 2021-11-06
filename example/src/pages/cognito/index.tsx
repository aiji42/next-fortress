import styles from '../../styles/Home.module.css'
import Head from 'next/head'
import { useEffect, useState, VFC } from 'react'
import { Auth } from 'aws-amplify'
import { Text } from '@geist-ui/react'
import Link from 'next/link'

const IndexPage: VFC = () => {
  const [login, setLogin] = useState(false)
  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(() => setLogin(true))
      .catch(() => setLogin(false))
  }, [])
  return (
    <>
      <Head>
        <title>Amazon Cognito Example | Next Fortress</title>
      </Head>

      <Text h2 font="24px">
        Amazon Cognito example
      </Text>

      <p>This page can be accessed by anyone, with or without a login.</p>
      <p>You can access My Page only when you are logged in.</p>

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

        <Link href="/cognito/authed" prefetch={false}>
          <div className={styles.card}>
            <h2>Go My Page &rarr;</h2>
            {!login && <p>(Not Allowed)</p>}
          </div>
        </Link>
      </div>
    </>
  )
}

export default IndexPage
