import Head from 'next/head'
import { VFC } from 'react'
import { Button, Spacer, Text } from '@geist-ui/react'
import Cookies from 'js-cookie'
import { useRouter } from 'next/router'

const Page: VFC = () => {
  const router = useRouter()
  const resetIPToCookie = () => {
    Cookies.remove('__allowed_ips')
    router.reload()
  }

  return (
    <>
      <Head>
        <title>Admin | IP Protect Example | Next Fortress</title>
      </Head>

      <Text h2 font="24px">
        Admin | IP protect example
      </Text>

      <p>Your IP address is allowed to access.</p>

      <strong>Allowed IPs: {Cookies.get('__allowed_ips')}</strong>

      <Spacer h={0.5} />
      <Button auto ml="20px" onClick={resetIPToCookie}>
        reset allowed IP
      </Button>
    </>
  )
}

export default Page
