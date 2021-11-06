[![codecov](https://codecov.io/gh/aiji42/next-fortress/branch/main/graph/badge.svg?token=HG8SOQXGCN)](https://codecov.io/gh/aiji42/next-fortress)
[![npm version](https://badge.fury.io/js/next-fortress.svg)](https://badge.fury.io/js/next-fortress)

# :japanese_castle: next-fortress

This package is a Next.js plugin that provides server-side access control for users when they are in a non-authenticated state.

IPs, Firebase, Amazon Cognito and Auth0 are used to determine authentication, and when a user is in a non-authenticated state, it is possible to redirect or rewrite.

This plugin uses Next.js v12 middleware to control access with edge functions, which makes it faster and reduces client-side code.

## Example

[next-fortress example](https://next-fortress.vercel.app)

## Require

- Using Next.js >=12

This plugin depends on the middleware of Next.js v12. If you are using Next.js v11 or earlier, please use [next-fortress v2](https://www.npmjs.com/package/next-fortress/v/2.2.2).

## Installation

```
npm install --save next-fortress
```

## Usage

All functions define their own `fallback` and use it as an argument. `fallback` is a control command in the unauthenticated state to select `rewrite`, `redirect`, and the middleware function.
```ts
type Fallback = Middleware | {
    type: 'rewrite';
    destination: string;
} | {
    type: 'redirect';
    destination: string;
    statusCode?: 301 | 302 | 303 | 307 | 308;
};

type Middleware = (request: NextRequest, event?: NextFetchEvent) => Response | undefined;
```

### Control by IP address

[example](https://next-fortress.vercel.app/ip)

```ts
// /pages/admin/_middleware.ts
import { makeIPInspector } from 'next-fortress'
import { NextRequest } from 'next/server'

export const middleware = (req: NextRequest) => {
  // type IPs = string | Array<string>
  // type makeIPInspector = (allowedIPs: IPs, fallback: Fallback) => Middleware
  // IP can be specified in CIDR format. You can also specify multiple IPs in an array.
  return makeIPInspector('123.123.123.123/32', {
    type: 'redirect',
    destination: '/'
  })(req)
}
```

### Control by Firebase

[example](https://next-fortress.vercel.app/firebase)


```ts
// /pages/mypage/_middleware.ts
import { makeFirebaseInspector } from 'next-fortress'
import { NextRequest } from 'next/server'

export const middleware = async (req: NextRequest) => {
  // type makeFirebaseInspector = (fallback: Fallback) => AsyncMiddleware;
  return makeFirebaseInspector(
    { type: 'redirect', destination: '/signin' }
  )(req)
}
```

Put the Firebase user token into the cookie using the following example.
```ts
// cient side code (for example /pages/_app.tsx)
import { FIREBASE_COOKIE_KEY } from 'next-fortress/dist/constants'

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in.
    user
      .getIdToken()
      .then((token) => document.cookie = `${FIREBASE_COOKIE_KEY}=${token}; path=/`)
  } else {
    // User is signed out.
    document.cookie = `${FIREBASE_COOKIE_KEY}=; path=/; expires=${
      new Date('1999-12-31T23:59:59Z').toUTCString()
    }`
  }
})
```

### Control by Amazon Cognito

[example](https://next-fortress.vercel.app/cognito)

```ts
// /pages/mypage/_middleware.ts
import { makeCognitoInspector } from 'next-fortress'
import { NextRequest } from 'next/server'

export const middleware = async (req: NextRequest) => {
  // type makeCognitoInspector =
  //     (fallback: Fallback, cognitoRegion: string, cognitoUserPoolId: string) => AsyncMiddleware;
  return makeCognitoInspector(
    { type: 'redirect', destination: '/signin' },
    process.env.COGNITO_REGION,
    process.env.COGNITO_USER_POOL_ID
  )(req)
}
```

Add `ssr: true` option to `Amplify.configure` to handle the Cognito cookies on the edge.
```ts
// cient side code (for example /pages/_app.tsx)
import Amplify from 'aws-amplify'

Amplify.configure({
  aws_cognito_identity_pool_id: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID,
  // ...omitted
  ssr: true // this line 
})
```

### Control by Auth0

[example](https://next-fortress.vercel.app/auth0)

```ts
// /pages/mypage/_middleware.ts
import { makeAuth0Inspector } from 'next-fortress'
import { NextRequest } from 'next/server'

export const middleware = async (req: NextRequest) => {
  // type makeAuth0Inspector = (fallback: Fallback, apiEndpoint: string) => AsyncMiddleware;
  return makeAuth0Inspector(
    { type: 'redirect', destination: '/singin' },
    '/api/auth/me' // api endpoint for auth0 profile
  )(req)
}
```

To use Auth0, the api root must have an endpoint. [@auth0/nextjs-auth0](https://github.com/auth0/nextjs-auth0#basic-setup)
```ts
// /pages/api/auth/[auth0].ts
import { handleAuth } from '@auth0/nextjs-auth0'

export default handleAuth()
```

## Contributing
Please read [CONTRIBUTING.md](https://github.com/aiji42/next-fortress/blob/main/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License
This project is licensed under the MIT License - see the [LICENSE](https://github.com/aiji42/next-fortress/blob/main/LICENSE) file for details
