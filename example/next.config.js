const withFortress = require('next-fortress')([
  {
    source: '/:path*',
    destination: 'https://google.com',
    inspect: 'ip',
    mode: 'redirect',
    ips: []
  }
])

module.exports = withFortress({
  reactStrictMode: true,
})
