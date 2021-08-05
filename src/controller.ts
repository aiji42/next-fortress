import { runReverseProxy } from './run-reverse-proxy'
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { Fort } from './types'
import getConfig from 'next/config'
import { Inspector } from './inspector'

const emptyProps = {
  props: {}
}

export const controller = async (
  inspector: Inspector,
  ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<Record<string, never>>> => {
  const host: string = getConfig().serverRuntimeConfig.fortress.host
  if (await inspector.exec(ctx)) {
    await runReverseProxy(ctx, host)
    return emptyProps
  }

  const forts: Fort[] = getConfig().serverRuntimeConfig.forts
  const fort = forts[Number(<string>ctx.query.__key)]
  if (fort.mode === 'redirect')
    return {
      redirect: {
        destination: fort.destination,
        statusCode: fort.statusCode ?? 302
      }
    }

  if (fort.mode === 'block') ctx.res.writeHead(fort.statusCode ?? 400).end()

  if (fort.mode === 'rewrite') await runReverseProxy(ctx, host, fort)

  return emptyProps
}
