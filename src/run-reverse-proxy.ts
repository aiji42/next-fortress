import { RewriteFort } from './types'
import { ParsedUrlQuery } from 'querystring'
import { GetServerSidePropsContext } from 'next'
import { reverseProxy } from './reverse-proxy'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as pathToRegexp from 'next/dist/compiled/path-to-regexp'

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
  { req, res, query }: GetServerSidePropsContext,
  host: string,
  fort?: RewriteFort
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
      path: fort ? getPath(fort.destination, query) : req.url,
      port: url?.port,
      headers
    },
    url === null || url.protocol === 'https:'
  )
}
