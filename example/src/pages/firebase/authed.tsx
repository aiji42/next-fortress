import { logout, auth } from '../../lib/firebase'
import styles from '../../styles/Home.module.css'
import Head from 'next/head'
import { VFC } from 'react'
import { Text } from '@geist-ui/react'

const Authed: VFC = () => {
  return (
    <>
      <Head>
        <title>My Page | Firebase Example | Next Fortress</title>
      </Head>

      <Text h2 font="24px">
        My Page | Firebase example
      </Text>

      <p>
        <strong>Hi! {auth.currentUser?.displayName}</strong>
      </p>
      <p>This page is accessible only to logged-in users.</p>

      <div className={styles.grid}>
        <button className={styles.card} onClick={logout}>
          <h2>Logout</h2>
        </button>
      </div>
    </>
  )
}

export default Authed
