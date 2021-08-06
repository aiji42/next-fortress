import { GetServerSidePropsContext } from 'next'

export type InspectByIp = {
  inspectBy: 'ip'
  ips: string | Array<string>
  failSafe?: boolean
}

export type InspectByFirebase = {
  inspectBy: 'firebase'
}

export type FortressFirebaseCredential = {
  clientEmail: string
  projectId: string
  privateKey: string
}

export type InspectByCognito = {
  inspectBy: 'cognito'
}

export type InspectByAuth0 = {
  inspectBy: 'auth0'
}

export type InspectByCustom = {
  inspectBy: 'custom'
}

// WIP
export type InspectByCookie = {
  inspectBy: 'cookie'
}

// WIP
export type InspectByHeader = {
  inspectBy: 'header'
}

export type Block = {
  mode: 'block'
  statusCode?: number
}

export type Redirect = {
  mode: 'redirect'
  statusCode?: 301 | 302 | 303 | 307 | 308
  destination: string
}

export type Rewrite = {
  mode: 'rewrite'
  destination: string
}

export type Operator = (
  fort: Fort,
  ctx: GetServerSidePropsContext
) => Promise<boolean>

export type FortBase = {
  source: string
} & (
  | InspectByIp
  | InspectByFirebase
  | InspectByCognito
  | InspectByAuth0
  | InspectByCookie
  | InspectByHeader
  | InspectByCustom
)

export type RewriteFort = FortBase & Rewrite

export type BlockFort = FortBase & Block

export type RedirectFort = FortBase & Redirect

export type Fort = RewriteFort | BlockFort | RedirectFort
