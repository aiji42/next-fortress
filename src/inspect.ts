import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import getConfig from 'next/config'
import { Fort } from './with-fortress'
import { reverseProxy } from './reverse-proxy'

export const runReverseProxy = async ({
  req,
  res
}: GetServerSidePropsContext): Promise<void> => {
  const headers = { ...req.headers }
  delete headers['user-agent']
  await reverseProxy(
    { req, res },
    {
      host: req.socket.localAddress,
      port: req.socket.localPort,
      method: req.method,
      path: req.url,
      headers
    },
    false
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const config: Fort =
    getConfig().serverRuntimeConfig.forts[<string>ctx.query.__key]

  console.log(config)

  if (config.mode === 'redirect')
    return {
      redirect: {
        destination: config.destination,
        statusCode: config.statusCode ?? 301
      }
    }

  if (config.mode === 'block') {
    ctx.res.writeHead(config.statusCode ?? 400)
    ctx.res.end()
    return {
      props: {}
    }
  }

  await runReverseProxy(ctx)

  return {
    props: {}
  }
}
