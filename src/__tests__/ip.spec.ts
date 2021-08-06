import { inspectIp, ip } from '../ip'
import { Fort } from '../types'
import { GetServerSidePropsContext } from 'next'

const OLD_ENV = { ...process.env }

describe('ip', () => {
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

  describe('ip', () => {
    beforeAll(() => {
      process.env = { ...OLD_ENV }
    })
    test('"inspectBy" is not "ip"', () => {
      return ip(
        { inspectBy: 'firebase' } as Fort,
        {
          req: { headers: { 'x-forwarded-for': '123.1.1.1' } }
        } as unknown as GetServerSidePropsContext
      ).then((res) => expect(res).toEqual(false))
    })
    test('"inspectBy" is "ip"', () => {
      return ip(
        { inspectBy: 'ip', ips: '123.1.1.1' } as Fort,
        {
          req: { headers: { 'x-forwarded-for': '123.1.1.1' } }
        } as unknown as GetServerSidePropsContext
      ).then((res) => expect(res).toEqual(true))
    })
    test('"headers" dose not have "x-forwarded-for" and failSafe is set true', () => {
      return ip(
        { inspectBy: 'ip', failSafe: true } as Fort,
        {
          req: { headers: {} }
        } as unknown as GetServerSidePropsContext
      ).then((res) => expect(res).toEqual(false))
    })
    test('"headers" dose not have "x-forwarded-for" and failSafe is set false', () => {
      return ip(
        { inspectBy: 'ip', failSafe: false } as Fort,
        {
          req: { headers: {} }
        } as unknown as GetServerSidePropsContext
      ).then((res) => expect(res).toEqual(true))
    })
    test('"headers" dose not have "x-forwarded-for" and failSafe is Not set when runs on production', () => {
      process.env.NODE_ENV = 'production'
      return ip(
        { inspectBy: 'ip' } as Fort,
        {
          req: { headers: {} }
        } as unknown as GetServerSidePropsContext
      ).then((res) => expect(res).toEqual(false))
    })
    test('"headers" dose not have "x-forwarded-for" and failSafe is Not set when runs on NOT production', () => {
      process.env.NODE_ENV = 'development'
      return ip(
        { inspectBy: 'ip' } as Fort,
        {
          req: { headers: {} }
        } as unknown as GetServerSidePropsContext
      ).then((res) => expect(res).toEqual(true))
    })
  })
})
