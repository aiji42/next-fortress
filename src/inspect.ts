import {GetServerSideProps, GetServerSidePropsContext} from "next";
import getConfig from 'next/config'
import {Fort} from "./with-fortress";
import {reverseProxy} from "./reverse-proxy";
import {ParsedUrlQuery} from "querystring";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as pathToRegexp from 'next/dist/compiled/path-to-regexp'

export const getPath = (config: Fort, query: ParsedUrlQuery): string => {
  const keys: {
    name: string
    prefix: string
    suffix: string
    pattern: string
    modifier: '*' | '?'
  }[] = []
  pathToRegexp.pathToRegexp(config.source, keys)
  let newPath = config.source
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
  { req, res, query }: GetServerSidePropsContext,
  config: Fort
): Promise<void> => {
  const headers = { ...req.headers }
  delete headers['user-agent']
  await reverseProxy(
    { req, res },
    {
      host: req.headers.host,
      method: req.method,
      path: getPath(config, query),
      headers
    }
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const config: Fort = getConfig().serverRuntimeConfig.forts[<string>ctx.query.__key]

  if (config.mode === 'rewrite')
    await runReverseProxy(ctx, config)

  if (config.mode === 'redirect')
    return {
      redirect: {
        destination: config.destination,
        statusCode: config.statusCode ?? 308
      }
    }

  if (config.mode === 'block') {
    ctx.res.writeHead(config.statusCode ?? 400)
  }

  return {
    props: {}
  }
}