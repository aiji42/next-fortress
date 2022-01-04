import { makeCognitoInspector } from 'next-fortress'

const region = process.env.NEXT_PUBLIC_COGNITO_REGION ?? ''
const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? ''
const userPoolWebClientId =
  process.env.NEXT_PUBLIC_COGNITO_USER_POOL_WEB_CLIENT_ID ?? ''

export const middleware = makeCognitoInspector(
  { type: 'redirect', destination: '/cognito' },
  { region, userPoolId, userPoolWebClientId }
)
