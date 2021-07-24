const withFortress = require('next-fortress')([
  {
    source: '/:foo*/rewrite',
    inspect: 'ip',
    mode: 'block',
    statusCode: 401,
    ips: []
  }
])

module.exports = withFortress({
  reactStrictMode: true,
})
