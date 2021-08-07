const withFortress = require('next-fortress')({
  forts: [
    // {
    //   source: '/:path((?!.*\\.\\w{2,4}$).+)', // Non static files
    //   inspectBy: 'ip',
    //   mode: 'block',
    //   ips: ["14.11.11.224"],
    //   failSafe: true
    // },
    {
      source: '/foo/redirect',
      inspectBy: 'ip',
      mode: 'redirect',
      destination: '/',
      ips: ["14.11.11.224"]
    },
    {
      source: '/foo/redirect2',
      inspectBy: 'ip',
      mode: 'redirect',
      destination: '/',
      ips: ["14.11.11.225"]
    },
    {
      source: '/foo/block',
      inspectBy: 'ip',
      mode: 'block',
      ips: ["14.11.11.224"]
    },
    {
      source: '/foo/block2',
      inspectBy: 'ip',
      mode: 'block',
      ips: ["14.11.11.225"]
    },
    {
      source: '/foo/rewrite',
      inspectBy: 'ip',
      mode: 'rewrite',
      destination: '/foo/rewritten',
      ips: ["14.11.11.224"]
    },
    {
      source: '/foo/rewrite2',
      inspectBy: 'ip',
      mode: 'rewrite',
      destination: '/foo/rewritten2',
      ips: ["14.11.11.225"]
    },
    {
      source: '/firebase/:path',
      inspectBy: 'firebase',
      mode: 'redirect',
      destination: '/firebase'
    },
    {
      source: '/cognito/:path',
      inspectBy: 'cognito',
      mode: 'redirect',
      destination: '/cognito'
    },
    {
      source: '/auth0/:path',
      inspectBy: 'auth0',
      mode: 'redirect',
      destination: '/auth0'
    }
  ],
  host: process.env.VERCEL_ENV === 'production'
    ? 'next-fortress.vercel.app'
    : (process.env.VERCEL_URL ?? 'http://localhost:3000'),
  firebase: {
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY
  }
})

const config = withFortress({
  reactStrictMode: true,
})

config.rewrites?.().then(console.log)

module.exports = config