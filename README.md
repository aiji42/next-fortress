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

module.export = withFortress({
  // write your next.js configuration values.
})
```

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

Control by IP of access source (x-forwarded-for).  
Specify the IPs to be allowed as a string or an array of strings, which can be written in CIDR format.

```js
const withFortress = require('next-fortress')({
  forts: [
    {
      inspectBy: 'ip',
      ips: '11.22.33.44', // string | Array<string>
      // ...controllMode1
    },
    {
      inspectBy: 'ip',
      ips: ['11.22.33.0/24', '111.222.0.0/16'], // It can be written in CIDR format.
      // ...controllMode2
    }
  ]
})
```

#### Redirect
```js
const withFortress = require('next-fortress')({
  forts: [
    {
      inspectBy: 'ip',
      ips: ['11.22.33.0/24', '111.222.0.0/16'],
      mode: 'redirect',
      source: '/redirectable/:path*', // from
      destination: '/top', // to
      statuCode: 307, // optional (default is 302)
    }
  ]
})
```

#### Access Block
```js
const withFortress = require('next-fortress')({
  forts: [
    {
      inspectBy: 'ip',
      ips: ['11.22.33.0/24', '111.222.0.0/16'],
      mode: 'block',
      source: '/blockable/:path*', // from
      statuCode: 401, // optional (default is 400)
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
      mode: 'rewrite',
      source: '/rewritable/:slug', // from
      destination: '/rewriten/:slug', // to
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
      // ...controllMode1
    }
  ],
  firebase: {
    clientEmail: 'your client emai',
    projectId: 'your project id',
    privateKey: 'your private key'
  }
})
```

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

#### Redirect

```js
const withFortress = require('next-fortress')({
  forts: [
    {
      inspectBy: 'firebase',
      mode: 'redirect',
      source: '/need-login/:path*', // from
      destination: '/login', // to
      statuCode: 307, // optional (default is 302)
    }
  ],
  firebase: {
    clientEmail: 'your client emai',
    projectId: 'your project id',
    privateKey: 'your private key'
  }
})
```

#### Block
```js
const withFortress = require('next-fortress')({
  forts: [
    {
      inspectBy: 'firebase',
      mode: 'block',
      source: '/need-login/:path*', // from
      statuCode: 401, // optional (default is 400)
    }
  ],
  firebase: {
    clientEmail: 'your client emai',
    projectId: 'your project id',
    privateKey: 'your private key'
  }
})
```

#### Rewrite
```js
const withFortress = require('next-fortress')({
  forts: [
    {
      inspectBy: 'firebase',
      mode: 'rewrite',
      source: '/need-login/:slug', // from
      destination: '/:slug', // to
    }
  ],
  firebase: {
    clientEmail: 'your client emai',
    projectId: 'your project id',
    privateKey: 'your private key'
  }
})
```

---

### When controlling by Cognito

WIP

---

### When controlling by Auth0

WIP

---

### When controlling by Other Auth Providers

WIP

---

## Contributing
Please read [CONTRIBUTING.md](https://github.com/aiji42/next-fortress/blob/main/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License
This project is licensed under the MIT License - see the [LICENSE](https://github.com/aiji42/next-fortress/blob/main/LICENSE) file for details
