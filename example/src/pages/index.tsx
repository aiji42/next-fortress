import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>Next Fortress</title>
      </Head>

      <div className={styles.grid}>
        <Link href="/ip">
          <div className={styles.card}>
            <h2>IP Protection &rarr;</h2>
          </div>
        </Link>

        <Link href="/firebase">
          <div className={styles.card}>
            <h2>firebase &rarr;</h2>
          </div>
        </Link>

        <Link href="/cognito">
          <div className={styles.card}>
            <h2>Cognito &rarr;</h2>
          </div>
        </Link>

        <Link href="/auth0">
          <div className={styles.card}>
            <h2>Auth0 &rarr;</h2>
          </div>
        </Link>
      </div>
    </>
  )
}
