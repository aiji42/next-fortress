import Head from 'next/head'
import { useEffect, VFC } from 'react'
import Cookies from 'js-cookie'
import { Button, Text, Spacer, Input, useInput, Link } from '@geist-ui/react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'

const IndexPage: VFC = () => {
  const router = useRouter()
  const { state: ips, setState: setIps, reset, bindings } = useInput('')
  useEffect(() => {
    const cookie = Cookies.get('__allowed_ips')
    cookie && setIps(cookie)
  }, [])
  const setIPToCookie = () => {
    Cookies.set('__allowed_ips', ips, { path: '/' })
    router.reload()
  }
  const resetIPToCookie = () => {
    Cookies.remove('__allowed_ips')
    router.reload()
    reset()
  }

  return (
    <>
      <Head>
        <title>IP Protect Example | Next Fortress</title>
      </Head>

      <Text h2 font="24px">
        IP protect example
      </Text>

      <p>
        This page can be accessed by anyone. The admin page can only be reached
        from allowed IPs.
      </p>
      <p>
        First, try to go to the Admin page without entering anything (access
        will be denied because you do not have an allowed IP). After that, enter
        the IP you want to allow and go to the admin page again.
      </p>

      <Spacer h={1} />
      <NextLink href="/ip/admin" prefetch={false}>
        <Link block scale={2}>
          Go to admin page
        </Link>
      </NextLink>
      <Spacer h={2} />

      <Input {...bindings} scale={5 / 3} placeholder="123.123.123.123/32" />
      <Spacer h={0.5} />
      <Button auto type="secondary" onClick={setIPToCookie}>
        set allowed IP
      </Button>
      <Button auto ml="20px" onClick={resetIPToCookie}>
        reset
      </Button>
    </>
  )
}

export default IndexPage
