const withFortress = require('next-fortress')([
  {
    source: '/foo/redirect',
    inspectBy: 'ip',
    mode: 'redirect',
    destination: '/',
    ips: []
  },
  {
    source: '/foo/block',
    inspectBy: 'ip',
    mode: 'block',
    ips: []
  }
])

module.exports = withFortress({
  reactStrictMode: true,
})
