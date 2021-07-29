import { RouteHas, Rewrite } from 'next/dist/lib/load-custom-routes'
import { mergeRewrites } from './merge-rewrites'
import { Fort } from './types'

export type Rewrites =
  | {
      beforeFiles?: Rewrite[]
      afterFiles?: Rewrite[]
      fallback?: Rewrite[]
    }
  | Rewrite[]

const rule = (
  source: string,
  destination: string,
  has: RouteHas[]
): Rewrite => ({
  source,
  destination,
  has
})

export const makeRewrites =
  (options: Fort[], originalRewrite: (() => Promise<Rewrites>) | undefined) =>
  async (): Promise<Rewrites> => {
    const rewrite = await originalRewrite?.()

    return mergeRewrites(
      rewrite,
      options.map((fort, index) =>
        // Access from the browser will be directed to the RP,
        // but access from the RP will be directed to the normal path.
        rule(fort.source, `/_fortress/${index}`, [
          { type: 'header', key: 'user-agent' }
        ])
      )
    )
  }
