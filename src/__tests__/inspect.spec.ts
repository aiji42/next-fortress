import { inspectIp, getPath } from '../inspect'

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
})
