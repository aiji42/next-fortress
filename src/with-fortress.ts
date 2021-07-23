import { NextConfig } from 'next/dist/next-server/server/config-shared'

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
  statusCode?: number
  destination: string
}

type Rewrite = {
  mode: 'rewrite'
  destination: string
}

type Fort = {
  source: string
} & (Block | Redirect | Rewrite) &
  (InspectByIp | InspectByCookie | InspectByHeader)

export const withFortress =
  (forts: Fort[]) =>
  (config: Partial<NextConfig>): Partial<NextConfig> => {
    console.log(forts)
    return {
      ...config
    }
  }
