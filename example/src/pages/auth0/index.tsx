import styles from '../../styles/Home.module.css'
import Head from 'next/head'
import { VFC } from 'react'
import { useUser } from '@auth0/nextjs-auth0'
import { Text } from '@geist-ui/react'
import Link from 'next/link'

const IndexPage: VFC = () => {
  const { user } = useUser()
  return (
    <>
      <Head>
        <title>Auth0 Example | Next Fortress</title>
      </Head>

      <Text h2 font="24px">
        Auth0 example
      </Text>

      <p>This page can be accessed by anyone, with or without a login.</p>
      <p>You can access My Page only when you are logged in.</p>

      <div className={styles.grid}>
        {!user ? (
          <a href="/api/auth/login?returnTo=/auth0" className={styles.card}>
            <h2>Login</h2>
            <p>You are Not logged in.</p>
          </a>
        ) : (
          <a href="/api/auth/logout" className={styles.card}>
            <h2>Logout</h2>
            <p>You are logged in.</p>
          </a>
        )}

        <Link href="/auth0/authed" passHref>
          <div className={styles.card}>
            <h2>Go My Page &rarr;</h2>
            {!user && <p>(Not Allowed)</p>}
          </div>
        </Link>
      </div>
    </>
  )
}

export default IndexPage
