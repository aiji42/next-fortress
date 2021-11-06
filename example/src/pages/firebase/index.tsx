import { login, logout, auth } from '../../lib/firebase'
import styles from '../../styles/Home.module.css'
import Head from 'next/head'
import { VFC } from 'react'
import { Text } from '@geist-ui/react'

const IndexPage: VFC = () => {
  return (
    <>
      <Head>
        <title>Firebase Example | Next Fortress</title>
      </Head>

      <Text h2 font="24px">
        Firebase example
      </Text>

      <p>This page can be accessed by anyone, with or without a login.</p>
      <p>You can access My Page only when you are logged in.</p>

      <div className={styles.grid}>
        {!auth.currentUser ? (
          <button className={styles.card} onClick={login}>
            <h2>Login</h2>
            <p>You are Not logged in.</p>
          </button>
        ) : (
          <button className={styles.card} onClick={logout}>
            <h2>Logout</h2>
            <p>You are logged in.</p>
          </button>
        )}

        <a href="/firebase/authed" className={styles.card}>
          <h2>Go My Page &rarr;</h2>
          {!auth.currentUser && <p>(Not Allowed)</p>}
        </a>
      </div>
    </>
  )
}

export default IndexPage
