import styles from '../../styles/Home.module.css'
import Head from 'next/head'
import { VFC } from 'react'

import { useUser } from '@auth0/nextjs-auth0'
import { Text } from '@geist-ui/react'

const Authed: VFC = () => {
  const { user } = useUser()
  return (
    <>
      <Head>
        <title>My Page | Auth0 Example | Next Fortress</title>
      </Head>

      <Text h2 font="24px">
        My Page | Auth0 Example
      </Text>

      <p>
        <strong>Hi! {user?.name}</strong>
      </p>
      <p>This page is accessible only to logged-in users.</p>

      <div className={styles.grid}>
        <a href="/api/auth/logout" className={styles.card}>
          <h2>Logout</h2>
          <p>You will be redirected to the page you were on.</p>
        </a>
      </div>
    </>
  )
}

export default Authed
