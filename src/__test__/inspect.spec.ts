import { inspectIp } from '../inspect'

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
})
