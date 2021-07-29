[![codecov](https://codecov.io/gh/aiji42/next-fortress/branch/main/graph/badge.svg?token=HG8SOQXGCN)](https://codecov.io/gh/aiji42/next-fortress)
[![npm version](https://badge.fury.io/js/next-fortress.svg)](https://badge.fury.io/js/next-fortress)

# :japanese_castle: next-fortress

This package is a Next.js plugin that provides server-side access control for users when they are in a non-authenticated state.

IPs, cookies, and headers are used to determine authentication, and when a user is in a non-authenticated state, it is possible to respond with a block (return of arbitrary status), redirect, or rewrite (alternative content).

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
  forts: [
    // redirectable
    {
      source: '/need/access/from/internal',
      mode: 'redirect',
      destination: '/top',
      inspectBy: 'ip',
      ips: ['1.2.3.4/32', '11.22.33.44']
    },
    // blockable
    {
      source: '/access/deny',
      mode: 'block',
      statuCode: 403,
      inspectBy: 'ip',
      ips: ['1.2.3.4/32', '11.22.33.44']
    }
  ],
  host: process.env.VERCEL_URL ?? 'http:localhost:3000'
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

## Parameters

Use a combination of control modes and inspection methods

### Control Modes

#### Redirect
Redirects to the specified path.

```js
const withFortress = require('next-fortress')({
  forts: [
    {
      mode: 'redirect',
      source: '/redirectable/:path*', // from
      destination: '/top', // to
      statuCode: 302, // optional (default is 301)
      // ...inspectMethod
    }
  ]
})
```

#### Block
Returns an arbitrary status code.

```js
const withFortress = require('next-fortress')({
  forts: [
    {
      mode: 'block',
      source: '/blockable/:path*', // from
      statuCode: 401, // optional (default is 400)
      // ...inspectMethod
    }
  ]
})
```

#### Rewrite
The client-side URL will remain unchanged, and another URL will be displayed as dummy content.

```js
const withFortress = require('next-fortress')({
  forts: [
    {
      mode: 'rewrite',
      source: '/rewritable/:slug', // from
      destination: '/rewriten/:slug', // to
      // ...inspectMethod
    }
  ]
})
```

### Inspection Methods

#### IP
Control by IP of access source (x-forwarded-for).

```js
const withFortress = require('next-fortress')({
  forts: [
    {
      // ...controllMode1,
      inspectBy: 'ip',
      ips: '11.22.33.44' // string | Array<string>
    },
    {
      // ...controllMode2,
      inspectBy: 'ip',
      ips: ['11.22.33.0/24', '111.222.0.0/16'] // Can be written in CIDR
    }
  ]
})
```

#### Cookie

wip

#### header

wip

## Contributing
Please read [CONTRIBUTING.md](https://github.com/aiji42/next-fortress/blob/main/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License
This project is licensed under the MIT License - see the [LICENSE](https://github.com/aiji42/next-fortress/blob/main/LICENSE) file for details
