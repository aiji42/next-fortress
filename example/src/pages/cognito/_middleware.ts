import { makeCognitoInspector } from 'next-fortress'

const region = process.env.NEXT_PUBLIC_COGNITO_REGION ?? ''
const poolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? ''

export const middleware = makeCognitoInspector(
  { type: 'redirect', destination: '/cognito' },
  region,
  poolId
)
