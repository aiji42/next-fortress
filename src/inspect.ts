import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import getConfig from 'next/config'
import { Fort, InspectByIp, RewriteFort } from './types'
import { reverseProxy } from './reverse-proxy'
import ipCidr from 'ip-cidr'
import { ParsedUrlQuery } from 'querystring'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as pathToRegexp from 'next/dist/compiled/path-to-regexp'
import { verifyFirebaseIdToken } from './firebase-server'

export const inspectIp = (
  ips: InspectByIp['ips'],
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

export const getPath = (
  destination: RewriteFort['destination'],
  query: ParsedUrlQuery
): string => {
  const keys: {
    name: string
    prefix: string
    suffix: string
    pattern: string
    modifier: '*' | '?'
  }[] = []
  pathToRegexp.pathToRegexp(destination, keys)
  let newPath = destination
  for (const key of keys) {
    const value = query[key.name]
    if (value && Array.isArray(value))
      newPath = newPath.replace(
        `:${key.name}${key.modifier}`,
        value.map((v) => `${key.prefix}${v}${key.suffix}`).join('')
      )
    else if (value)
      newPath = newPath.replace(
        `:${key.name}${key.modifier}`,
        `${key.prefix}${value}${key.suffix}`
      )
    else newPath = newPath.replace(`:${key.name}${key.modifier}`, '')
    newPath = newPath.replace(`(${key.pattern})`, '')
  }

  return newPath.replace(/\/\//g, '/')
}

export const runReverseProxy = async (
  { req, res }: GetServerSidePropsContext,
  host: string,
  path?: string
): Promise<void> => {
  const headers = { ...req.headers }
  delete headers['user-agent']
  let url: null | URL = null
  try {
    url = new URL(host)
  } catch (_e) {
    // no operation
  }
  await reverseProxy(
    { req, res },
    {
      host: url?.hostname ?? host,
      method: req.method,
      path: path ?? req.url,
      port: url?.port,
      headers
    },
    url === null || url.protocol === 'https:'
  )
}

const emptyProps = {
  props: {}
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const fort: Fort =
    getConfig().serverRuntimeConfig.forts[<string>ctx.query.__key]
  const host: string = getConfig().serverRuntimeConfig.fortress.host

  let allow = false
  if (fort.inspectBy === 'ip' && ctx.req.headers['x-forwarded-for'])
    allow = inspectIp(fort.ips, ctx.req.headers['x-forwarded-for'])
  if (fort.inspectBy === 'firebase') allow = await verifyFirebaseIdToken(ctx)

  if (allow) {
    await runReverseProxy(ctx, host)
    return emptyProps
  }

  if (fort.mode === 'redirect')
    return {
      redirect: {
        destination: fort.destination,
        statusCode: fort.statusCode ?? 302
      }
    }

  if (fort.mode === 'block') ctx.res.writeHead(fort.statusCode ?? 400).end()

  if (fort.mode === 'rewrite')
    await runReverseProxy(ctx, host, getPath(fort.destination, ctx.query))

  return emptyProps
}
