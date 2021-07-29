const withFortress = require('next-fortress')({
  forts: [
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
    }
  ],
  host: process.env.VERCEL_URL ?? 'http://localhost:3000'
})

const config = withFortress({
  reactStrictMode: true,
})

config.rewrites?.().then(console.log)

module.exports = config