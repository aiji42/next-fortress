import { NextConfig } from 'next/dist/next-server/server/config-shared'
import { prepareFortressInspect } from './prepare-fortress-inspect'
import { makeRewrites } from './make-rewrites'

type InspectByIp = {
  inspectBy: 'ip'
  ips: string | Array<string>
}

// WIP
type InspectByCookie = {
  inspectBy: 'cookie'
}

// WIP
type InspectByHeader = {
  inspectBy: 'header'
}

type Block = {
  mode: 'block'
  statusCode?: number
}

type Redirect = {
  mode: 'redirect'
  statusCode?: 301 | 302 | 303 | 307 | 308
  destination: string
}

type Rewrite = {
  mode: 'rewrite'
  destination: string
}

export type Fort = {
  source: string
} & (Block | Redirect | Rewrite) &
  (InspectByIp | InspectByCookie | InspectByHeader)

export const withFortress =
  (forts: Fort[]) =>
  (config: Partial<NextConfig>): Partial<NextConfig> => {
    prepareFortressInspect()

    return {
      ...config,
      rewrites: <NextConfig['rewrites']>makeRewrites(forts, config.rewrites),
      serverRuntimeConfig: {
        ...config.serverRuntimeConfig,
        forts
      }
    }
  }
