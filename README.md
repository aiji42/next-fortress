[![codecov](https://codecov.io/gh/aiji42/next-fortress/branch/main/graph/badge.svg?token=HG8SOQXGCN)](https://codecov.io/gh/aiji42/next-fortress)
[![npm version](https://badge.fury.io/js/next-fortress.svg)](https://badge.fury.io/js/next-fortress)

# :japanese_castle: next-fortress

This package is a Next.js plugin that provides server-side access control for users when they are in a non-authenticated state.

IPs, Firebase, Cognito and Auth0 are used to determine authentication, and when a user is in a non-authenticated state, it is possible to respond with a block (return of arbitrary status), redirect, or rewrite (alternative content).

Usually, these controls are performed by `useEffect` on the client side, and by `getServerSideProps` on the server side, but if there are multiple pages for access control, the number of places to configure them increases, and the management becomes complicated. This plugin relieves you from the stress of implementing these controls.

## Installation

```
npm install --save next-fortress
```

## Usage
Write `withFortress` in `next.config.js`.

```js
// next.config.js
const withFortress = require('next-fortress')({
  // for example
  forts: [
    // redirectable by Firebase auth
    {
      source: '/need/login',
      mode: 'redirect',
      destination: '/login',
      inspectBy: 'firebase'
    },
    // blockable by allowed IPs list
    {
      source: '/access/deny',
      mode: 'block',
      inspectBy: 'ip',
      ips: ['1.2.3.4/32', '11.22.33.44']
    }
  ],
  host: process.env.VERCEL_URL ?? 'http:localhost:3000',
  firebase: {
    clientEmail: 'your client emai',
    projectId: 'your project id',
    privateKey: 'your private key'
  }
})

module.exports = withFortress({
  // write your next.js configuration values.
})
```

- `forts: Fort[]`: See [Use Case](#use-case).
- `host?: string`: In order to inspect the request and control the response, a reverse proxy is launched internally. Therefore, it is necessary to specify the host of the target deployment itself. The Default value is `process.env.VERCEL_URL ?? '0.0.0.0'`
- `firebase?: FirebaseAdminCredential`: See [When controlling by Firebase auth](#when-controlling-by-firebase-auth).
- `prepared?: boolean`: See [About the file for inspection](#about-the-file-for-inspection). The Default value is `false`


If you are using next-compose-plugins
```js
// next.config.js
const withPlugins = require('next-compose-plugins')
const withFortress = require('next-fortress')({ ... })

module.exports = withPlugins([
  withFortress
  // your other plugins here
], {
  // write your next.js configuration values.  
})
```

## Use Case

### When controlling by IP

Control by IP of request source (x-forwarded-for).  
Specify the IPs to be allowed as a string or an array of strings, which can be written in CIDR format.

```js
const withFortress = require('next-fortress')({
  forts: [
    {
      inspectBy: 'ip',
      ips: '11.22.33.44', // string | Array<string>
      // ...controlMode
    },
    {
      inspectBy: 'ip',
      ips: ['11.22.33.0/24', '111.222.0.0/16'], // It can be written in CIDR format.
      failSafe: true, // See description below.
      // ...controlMode
    }
  ]
})
```

It uses `x-forwarded-for` to get the IP of the requestor. Therefore, it is not possible to control by IP in the development environment.  
You can use `failSafe` to control whether the request is controlled or passed through in the case that such an IP could not be gotten. 
- `failSafe?: boolean`: The default value is `process.env.NODE_ENV === 'production'`.
    - `true`: If it fails to get the IP, it must control the request according to the control mode.
    - `false`: If it fails to get the IP, the request will be passed through.

#### Redirect
```js
const withFortress = require('next-fortress')({
  forts: [
    {
      inspectBy: 'ip',
      ips: ['11.22.33.0/24', '111.222.0.0/16'],
      // ↓ control mode ↓
      mode: 'redirect',
      source: '/redirectable/:path*', // from
      destination: '/top', // to
      statuCode: 307, // optional (default is 302)
      // ↑ control mode ↑
    }
  ]
})
```

#### Request Block
```js
const withFortress = require('next-fortress')({
  forts: [
    {
      inspectBy: 'ip',
      ips: ['11.22.33.0/24', '111.222.0.0/16'],
      // ↓ control mode ↓
      mode: 'block',
      source: '/blockable/:path*', // from
      statuCode: 401, // optional (default is 400)
      // ↑ control mode ↑
    }
  ]
})
```

#### Rewrite
```js
const withFortress = require('next-fortress')({
  forts: [
    {
      inspectBy: 'ip',
      ips: ['11.22.33.0/24', '111.222.0.0/16'],
      // ↓ control mode ↓
      mode: 'rewrite',
      source: '/rewritable/:slug', // from
      destination: '/rewriten/:slug', // to
      // ↑ control mode ↑
    }
  ]
})
```

---

### When controlling by Firebase auth

If you are using Firebase auth, you can control access with a very simple configuration.  
To use it, you need a service account key, go to Firebase console > Settings > Service Account, get the json file, and enter the required values as shown below.

```js
// next.config.js
const withFortress = require('next-fortress')({
  forts: [
    {
      inspectBy: 'firebase',
      // ...controlMode
    }
  ],
  firebase: {
    clientEmail: 'your client emai',
    projectId: 'your project id',
    privateKey: 'your private key'
  }
})
```

**Control Mode** 
- `redirect`: See [Redirect](#redirect)
- `block`: See [Request Block](#request-block)
- `rewrite`: See [Rewrite](#rewrite)

Put useFortressWithFirebase in your page/_app.jsx.  
Without this code, the authentication status cannot be verified on the server side.

```tsx
// pages/_app.tsx (.jsx)
import { useFortressWithFirebase } from 'next-fortress/build/client'
import firebase from 'firebase/app'

function MyApp({ Component, pageProps }: AppProps) {
  useFortressWithFirebase(firebase)

  return <Component {...pageProps} />
}
```

---

### When controlling by Cognito

If you are using Cognito, then the setup is very simple.

```js
// next.config.js
const withFortress = require('next-fortress')({
  forts: [
    {
      inspectBy: 'cognito',
      // ...controlMode
    }
  ]
})
```

**Control Mode** 
- `redirect`: See [Redirect](#redirect)
- `block`: See [Request Block](#request-block)
- `rewrite`: See [Rewrite](#rewrite)

Add `ssr: true` to the client side `Amplify.configure`.

```tsx
Amplify.configure({
  // ... your configurations,
  ssr: true
})
```

---

### When controlling by Auth0

Currently, Auth0 only supports mode of [Regular Web Application](https://auth0.com/docs/get-started/create-apps/regular-web-apps).

```js
// next.config.js
const withFortress = require('next-fortress')({
  forts: [
    {
      inspectBy: 'auth0',
      // ...controlMode
    }
  ]
})
```

**Control Mode** 
- `redirect`: See [Redirect](#redirect)
- `block`: See [Request Block](#request-block)
- `rewrite`: See [Rewrite](#rewrite)

---

### When Customizing the inspection method

It is possible to self-define the method of inspecting requests.  
For `prepared: true`, see [About the file for inspection](#about-the-file-for-inspection).

```js
// next.config.js
const withFortress = require('next-fortress')({
  forts: [
    {
      inspectBy: 'custom',
      // ...controlMode
    }
  ],
  prepared: true
})
```

Customize `pages/_fortress/[__key].js` as follows.

```ts
// pages/_fortress/[__key].js
import { Inspector } from 'next-fortress/build/inspector'
import { controller } from 'next-fortress/build/controller'

// (fort: Fort, ctx: GetServerSideContext) => Promise<boolean>
const customInspector = async (fort, ctx) => {
  // Write your custom inspect method
  // Return true when directing the request to normal content, false when causing it to fallback.
}
const inspector = new Inspector().add(customInspector)

export const getServerSideProps = async (ctx) => {
  return controller(inspector, ctx)
}
const Fortress = () => null
export default Fortress
```

---

## About the file for inspection

This plugin will automatically add `pages/_fortress/[__key].js` when the server is started.  
It is used to inspect requests and control responses based on the `forts` you set.  
It will always be overwritten on server starts to keep up with changes in the plugin.

If for some reason you want to prevent overwriting (e.g. custom processing), or if you can't create that file automatically (e.g. monorepo configuration), you can switch to manual by adding `prepared: true` to the configuration.  
```js
const withFortress = require('next-fortress')({
  forts: [
    { ... }
  ],
  prepared: true
})
```

## :construction: Caution

**Please do not use `next/link` to generate links to pages you want to control access to.**

The link tag generated by `next/link` will request the target page for a js file when clicked. Unfortunately, it is not possible to control access to that URL.

## Contributing
Please read [CONTRIBUTING.md](https://github.com/aiji42/next-fortress/blob/main/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License
This project is licensed under the MIT License - see the [LICENSE](https://github.com/aiji42/next-fortress/blob/main/LICENSE) file for details
