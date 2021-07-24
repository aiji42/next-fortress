import { makeRewrites } from '../make-rewrites'

describe('makeRewrites', () => {
  it('must return a rewrite rule', () => {
    return makeRewrites(
      [
        {
          source: '/foo/:path*',
          mode: 'block',
          inspectBy: 'ip',
          ips: []
        }
      ],
      undefined
    )().then((res) => {
      expect(res).toEqual({
        beforeFiles: [
          {
            source: '/foo/:path*',
            destination: '/_fortress/0',
            has: [{ type: 'header', key: 'user-agent' }]
          }
        ]
      })
    })
  })

  it('must return rewrite rules', () => {
    return makeRewrites(
      [
        {
          source: '/foo/:path*',
          mode: 'block',
          inspectBy: 'ip',
          ips: []
        },
        {
          source: '/bar/:path*',
          mode: 'block',
          inspectBy: 'ip',
          ips: []
        }
      ],
      undefined
    )().then((res) => {
      expect(res).toEqual({
        beforeFiles: [
          {
            source: '/foo/:path*',
            destination: '/_fortress/0',
            has: [{ type: 'header', key: 'user-agent' }]
          },
          {
            source: '/bar/:path*',
            destination: '/_fortress/1',
            has: [{ type: 'header', key: 'user-agent' }]
          }
        ]
      })
    })
  })

  it('must return no rewrite rule when option is empty', () => {
    return makeRewrites([], undefined)().then((res) => {
      expect(res).toEqual({
        beforeFiles: []
      })
    })
  })

  it('must return merged rewrite rules', () => {
    return makeRewrites(
      [
        {
          source: '/foo/:path*',
          mode: 'block',
          inspectBy: 'ip',
          ips: []
        }
      ],
      async () => [{ source: '/foo/bar/:path*', destination: '/foo/bar' }]
    )().then((res) => {
      expect(res).toEqual({
        beforeFiles: [
          {
            source: '/foo/:path*',
            destination: '/_fortress/0',
            has: [{ type: 'header', key: 'user-agent' }]
          }
        ],
        afterFiles: [
          {
            source: '/foo/bar/:path*',
            destination: '/foo/bar'
          }
        ]
      })
    })
  })
})
