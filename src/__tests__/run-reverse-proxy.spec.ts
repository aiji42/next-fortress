import { getPath, runReverseProxy } from '../run-reverse-proxy'
import { reverseProxy } from '../reverse-proxy'
import { GetServerSidePropsContext } from 'next'

jest.mock('../reverse-proxy', () => ({
  reverseProxy: jest.fn()
}))

describe('run-reverse-proxy', () => {
  describe('getPath', () => {
    it('must return path string when using ":path*"', () => {
      expect(
        getPath('/foo/:path*', {
          path: ['foo', 'bar']
        })
      ).toEqual('/foo/foo/bar')
      expect(
        getPath('/foo/:path*/', {
          path: ['foo', 'bar']
        })
      ).toEqual('/foo/foo/bar/')
      expect(
        getPath('/foo/:path*/bar', {
          path: ['foo', 'bar']
        })
      ).toEqual('/foo/foo/bar/bar')
      expect(getPath('/foo/:path*', {})).toEqual('/foo/')
      expect(getPath('/foo/:path*', { path: 'bar' })).toEqual('/foo/bar')
    })
    it('must return path string when using regex conditions', () => {
      expect(getPath('/foo/bar-:id(\\d+)', { id: '123' })).toEqual(
        '/foo/bar-123'
      )
      expect(
        getPath('/foo/bar-:id(\\d+)/xyz-:slug(\\w+)', {
          id: '123',
          slug: 'xyz'
        })
      ).toEqual('/foo/bar-123/xyz-xyz')
    })
    it('must return path string when using complex conditions', () => {
      expect(
        getPath(
          '/foo/bar-:id(\\d+)/xyz-:slug(\\w+)/country-:country(japan|america)/:path*',
          {
            id: '123',
            slug: 'xyz',
            country: 'japan',
            path: ['aaa', 'bbb']
          }
        )
      ).toEqual('/foo/bar-123/xyz-xyz/country-japan/aaa/bbb')
    })
  })

  describe('runReverseProxy', () => {
    test('secure', () => {
      return runReverseProxy(
        {
          req: { headers: { foo: 'bar', 'user-agent': 'UA' }, url: '/example' },
          res: {},
          query: {}
        } as unknown as GetServerSidePropsContext,
        'example.com'
      ).then(() => {
        expect(reverseProxy).toBeCalledWith(
          {
            req: {
              headers: { foo: 'bar', 'user-agent': 'UA' },
              url: '/example'
            },
            res: {}
          },
          {
            headers: { foo: 'bar' },
            host: 'example.com',
            method: undefined,
            path: '/example',
            port: undefined
          },
          true
        )
      })
    })
    test('not secure', () => {
      return runReverseProxy(
        {
          req: { headers: { foo: 'bar', 'user-agent': 'UA' }, url: '/example' },
          res: {},
          query: {}
        } as unknown as GetServerSidePropsContext,
        'http:example.com',
        {
          source: '/example',
          destination: '/rewritten',
          mode: 'rewrite',
          inspectBy: 'firebase'
        }
      ).then(() => {
        expect(reverseProxy).toBeCalledWith(
          {
            req: {
              headers: { foo: 'bar', 'user-agent': 'UA' },
              url: '/example'
            },
            res: {}
          },
          {
            headers: { foo: 'bar' },
            host: 'example.com',
            method: undefined,
            path: '/rewritten',
            port: ''
          },
          false
        )
      })
    })
  })
})
