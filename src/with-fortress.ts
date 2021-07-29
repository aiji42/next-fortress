import { NextConfig } from 'next/dist/next-server/server/config-shared'
import { prepareFortressInspect } from './prepare-fortress-inspect'
import { makeRewrites } from './make-rewrites'
import { Fort } from './types'

export const withFortress =
  ({ forts, host }: { forts: Fort[]; host?: string }) =>
  (config: Partial<NextConfig>): Partial<NextConfig> => {
    prepareFortressInspect()

    return {
      ...config,
      rewrites: <NextConfig['rewrites']>makeRewrites(forts, config.rewrites),
      serverRuntimeConfig: {
        ...config.serverRuntimeConfig,
        forts,
        fortHost: host ?? process.env.VERCEL_URL ?? '0.0.0.0'
      }
    }
  }
