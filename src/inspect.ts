import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import getConfig from 'next/config'
import { Fort } from './with-fortress'
import { reverseProxy } from './reverse-proxy'
import ipCidr from 'ip-cidr'

export const inspectIp = (
  ips: string | string[],
  target: string | string[] | undefined
): boolean => {
  return (Array.isArray(ips) ? ips : [ips]).some((ip) => {
    if (!ipCidr.isValidAddress(ip)) return false
    const ipAddress = ipCidr.createAddress(ip)
    return new ipCidr(
      `${ipAddress.addressMinusSuffix}${ipAddress.subnet}`
    ).contains(
      Array.isArray(target) ? target[0] : target ? target.split(',')[0] : target
    )
  })
}

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

const emptyProps = {
  props: {}
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  console.log(ctx.query)
  console.log(ctx.req.url)
  const config: Fort =
    getConfig().serverRuntimeConfig.forts[<string>ctx.query.__key]

  console.log(config)

  let allow = false
  if (config.inspectBy === 'ip' && ctx.req.headers['x-forwarded-for']) {
    allow = inspectIp(config.ips, ctx.req.headers['x-forwarded-for'])
  }

  if (!allow) {
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
      return emptyProps
    }
  } else {
    await runReverseProxy(ctx)
  }

  return emptyProps
}
