import { NextConfig } from 'next/dist/next-server/server/config-shared'
import { prepareFortressInspect } from './prepare-fortress-inspect'
import { makeRewrites } from './make-rewrites'
import { Fort, FortressFirebaseCredential } from './types'

export const withFortress =
  ({
    forts,
    host,
    firebase
  }: {
    forts: Fort[]
    host?: string
    firebase?: FortressFirebaseCredential
  }) =>
  (config: Partial<NextConfig>): Partial<NextConfig> => {
    prepareFortressInspect()

    return {
      ...config,
      rewrites: <NextConfig['rewrites']>makeRewrites(forts, config.rewrites),
      serverRuntimeConfig: {
        ...config.serverRuntimeConfig,
        forts,
        fortress: {
          host: host ?? process.env.VERCEL_URL ?? '0.0.0.0',
          firebase
        }
      }
    }
  }
