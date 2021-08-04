import { inspectIp, getPath, getServerSideProps } from '../inspect'
import getConfig from 'next/config'
import { reverseProxy } from '../reverse-proxy'
import { verifyFirebaseIdToken } from '../firebase-server'
import { GetServerSidePropsContext } from 'next'

jest.mock('next/config', () => jest.fn())
jest.mock('../reverse-proxy', () => ({
  reverseProxy: jest.fn()
}))
jest.mock('../firebase-server', () => ({ verifyFirebaseIdToken: jest.fn() }))

describe('inspect', () => {
  test('inspectIp', () => {
    expect(inspectIp('123.1.1.1', undefined)).toEqual(false)
    expect(inspectIp('', '124.1.1.1')).toEqual(false)
    expect(inspectIp([], '124.1.1.1')).toEqual(false)
    expect(inspectIp('123.1.1.1', '123.1.1.1')).toEqual(true)
    expect(inspectIp('123.1.1.0/28', '123.1.1.2')).toEqual(true)
    expect(inspectIp('123.1.1.0/28', '124.1.1.1')).toEqual(false)
    expect(inspectIp(['123.1.1.0/28', '124.1.1.0/28'], '124.1.1.2')).toEqual(
      true
    )
    expect(inspectIp('123.1.1.0/28', '123.1.1.2,124.1.1.1')).toEqual(true)
    expect(inspectIp('123.1.1.0/28', ['123.1.1.2', '124.1.1.1'])).toEqual(true)
  })

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

  describe('getServerSidePops', () => {
    beforeAll(() => {
      ;(getConfig as jest.Mock).mockReturnValue({
        serverRuntimeConfig: {
          forts: [
            {
              source: '/ip/deny',
              inspectBy: 'ip',
              ips: '1.2.3.4',
              mode: 'block'
            },
            {
              source: '/ip/redirect',
              inspectBy: 'ip',
              ips: '1.2.3.4',
              mode: 'redirect',
              destination: '/redirected'
            },
            {
              source: '/ip/rewrite',
              inspectBy: 'ip',
              ips: '1.2.3.4',
              mode: 'rewrite',
              destination: '/rewritten'
            },
            {
              source: '/firebase',
              inspectBy: 'firebase',
              mode: 'redirect',
              destination: '/login'
            }
          ],
          fortress: {
            host: '0.0.0.0'
          }
        }
      })
    })
    test('IP-based block mode', () => {
      const writeHead = jest.fn().mockReturnValue({
        end: jest.fn()
      })
      return getServerSideProps({
        req: { headers: { 'x-forwarded-for': '11.22.33.44' } },
        res: { writeHead },
        query: { __key: 0 }
      } as unknown as GetServerSidePropsContext).then((result) => {
        expect(result).toEqual({ props: {} })
        expect(writeHead).toBeCalledWith(400)
      })
    })
    test('IP-based redirect mode', () => {
      return getServerSideProps({
        req: { headers: { 'x-forwarded-for': '11.22.33.44' } },
        query: { __key: 1 }
      } as unknown as GetServerSidePropsContext).then((result) => {
        expect(result).toEqual({
          redirect: {
            destination: '/redirected',
            statusCode: 302
          }
        })
      })
    })
    test('IP-based rewrite mode', () => {
      return getServerSideProps({
        req: { headers: { 'x-forwarded-for': '11.22.33.44' } },
        query: { __key: 2 }
      } as unknown as GetServerSidePropsContext).then((result) => {
        expect(result).toEqual({ props: {} })
        expect(reverseProxy).toBeCalledWith(
          {
            req: { headers: { 'x-forwarded-for': '11.22.33.44' } },
            res: undefined
          },
          {
            headers: { 'x-forwarded-for': '11.22.33.44' },
            host: '0.0.0.0',
            method: undefined,
            path: '/rewritten',
            port: undefined
          },
          true
        )
      })
    })
    test('IP-based pass through (access allowed)', () => {
      return getServerSideProps({
        req: { headers: { 'x-forwarded-for': '1.2.3.4' } },
        query: { __key: 0 }
      } as unknown as GetServerSidePropsContext).then((result) => {
        expect(result).toEqual({ props: {} })
        expect(reverseProxy).toBeCalledWith(
          {
            req: { headers: { 'x-forwarded-for': '1.2.3.4' } },
            res: undefined
          },
          {
            headers: { 'x-forwarded-for': '1.2.3.4' },
            host: '0.0.0.0',
            method: undefined,
            path: undefined,
            port: undefined
          },
          true
        )
      })
    })
    test('Firebase based redirect', () => {
      ;(verifyFirebaseIdToken as jest.Mock).mockReturnValue(false)
      return getServerSideProps({
        query: { __key: 3 }
      } as unknown as GetServerSidePropsContext).then((result) => {
        expect(result).toEqual({
          redirect: {
            destination: '/login',
            statusCode: 302
          }
        })
      })
    })
  })
})
