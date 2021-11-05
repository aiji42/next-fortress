import styles from '../../styles/Home.module.css'
import Head from 'next/head'
import { useEffect, useState, VFC } from 'react'
import { Auth } from 'aws-amplify'
import { Text } from '@geist-ui/react'

const Authed: VFC = () => {
  const [session, setSession] = useState<undefined | { username: string }>()
  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(setSession)
      .catch(() => setSession(undefined))
  }, [])
  return (
    <>
      <Head>
        <title>My Page | Cognito Example | Next Fortress</title>
      </Head>

      <Text h2 font="24px">
        My Page | Cognito Example
      </Text>

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
    </>
  )
}

export default Authed
