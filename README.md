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
import { makeIPInspector } from 'next-fortress/ip'

/*
  type IPs = string | Array<string>
  type makeIPInspector = (allowedIPs: IPs, fallback: Fallback) => Middleware
  // IP can be specified in CIDR format. You can also specify multiple IPs in an array.
*/
export const middleware = makeIPInspector('123.123.123.123/32', {
  type: 'redirect',
  destination: '/'
})
```

### Control by Firebase

[example](https://next-fortress.vercel.app/firebase)


```ts
// /pages/mypage/_middleware.ts
import { makeFirebaseInspector } from 'next-fortress/firebase'

/*
  type makeFirebaseInspector = (
    fallback: Fallback,
    customHandler?: (payload: any) => boolean
  ) => AsyncMiddleware
*/
export const middleware = makeFirebaseInspector(
  { type: 'redirect', destination: '/signin' }
)
```

Put the Firebase user token into the cookie using the following example.  
```ts
// cient side code (for example /pages/_app.tsx)
import { FIREBASE_COOKIE_KEY } from 'next-fortress/constants'

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

For the second argument of `makeFirebaseInspector`, you can pass a payload inspection function. This is useful, for example, if you want to ignore some authentication providers, or if you need to ensure that the email has been verified.  
If this function returns false, it will enter the fallback case.
```ts
// /pages/mypage/_middleware.ts
import { makeFirebaseInspector } from 'next-fortress/firebase'

// Redirect for anonymous users.
export const middleware = makeFirebaseInspector(
  { type: 'redirect', destination: '/signin' },
  (payload) => payload.firebase.sign_in_provider !== 'anonymous'
)
```

**NOTE**
- If you want to specify the cookie key, use the environment variable `FORTRESS_FIREBASE_COOKIE_KEY`.  
- If you use [session cookies](https://firebase.google.com/docs/auth/admin/manage-cookies) to share authentication data with the server side, set the environment variable `FORTRESS_FIREBASE_MODE` to `session`.

### Control by Amazon Cognito

[example](https://next-fortress.vercel.app/cognito)

```ts
// /pages/mypage/_middleware.ts
import { makeCognitoInspector } from 'next-fortress/cognito'

/*
  type UserPoolParams = {
    region: string;
    userPoolId: string;
    userPoolWebClientId: string;
  }

  type makeCognitoInspector = (
    fallback: Fallback,
    params: UserPoolParams,
    customHandler?: (payload: any) => boolean
  ) => AsyncMiddleware
*/
export const middleware = makeCognitoInspector(
  { type: 'redirect', destination: '/signin' },
  {
    region: process.env.COGNITO_REGION,
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    userPoolWebClientId: process.env.COGNITO_USER_POOL_WEB_CLIENT_ID,
  }
)
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

For the 3rd argument of `makeCognitoInspector`, you can pass a payload inspection function. This is useful, for example, if you want to ignore some authentication providers, or if you need to ensure that the email has been verified.  
If this function returns false, it will enter the fallback case.
```ts
// /pages/mypage/_middleware.ts
import { makeCognitoInspector } from 'next-fortress/cognito'

// Fallback if the email address is not verified.
export const middleware = makeCognitoInspector(
  { type: 'redirect', destination: '/signin' },
  {
    region: process.env.COGNITO_REGION,
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    userPoolWebClientId: process.env.COGNITO_USER_POOL_WEB_CLIENT_ID,
  },
  (payload) => payload.email_verified
)
```

### Control by Auth0

[example](https://next-fortress.vercel.app/auth0)

```ts
// /pages/mypage/_middleware.ts
import { makeAuth0Inspector } from 'next-fortress/auth0'

/*
  type makeAuth0Inspector = (
    fallback: Fallback,
    apiEndpoint: string,
    customHandler?: (payload: any) => boolean
  ) => AsyncMiddleware;
*/
export const middleware = makeAuth0Inspector(
  { type: 'redirect', destination: '/singin' },
  '/api/auth/me' // api endpoint for auth0 profile
)
```

To use Auth0, the api root must have an endpoint. [@auth0/nextjs-auth0](https://github.com/auth0/nextjs-auth0#basic-setup)
```ts
// /pages/api/auth/[auth0].ts
import { handleAuth } from '@auth0/nextjs-auth0'

export default handleAuth()
```

For the third argument of `makeAuth0Inspector`, you can pass a payload inspection function. This is useful, for example, if you need to ensure that the email has been verified.  
If this function returns false, it will enter the fallback case.
```ts
// /pages/mypage/_middleware.ts
import { makeAuth0Inspector } from 'next-fortress/auth0'

// Fallback if the email address is not verified.
export const middleware = makeAuth0Inspector(
  { type: 'redirect', destination: '/singin' },
  '/api/auth/me',
  (payload) => payload.email_verified
)
```

## Contributing
Please read [CONTRIBUTING.md](https://github.com/aiji42/next-fortress/blob/main/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License
This project is licensed under the MIT License - see the [LICENSE](https://github.com/aiji42/next-fortress/blob/main/LICENSE) file for details
