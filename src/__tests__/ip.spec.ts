import { makeIPInspector } from '../ip'
import { NextRequest } from 'next/server'
import { handleFallback } from '../handle-fallback'
import { Fallback } from '../types'

jest.mock('../handle-fallback', () => ({
  handleFallback: jest.fn()
}))

const fallback: Fallback = { type: 'redirect', destination: '/foo' }

describe('makeIPInspector', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('matched with allowedIp', () => {
    const request = {
      ip: '10.0.0.1'
    } as NextRequest
    makeIPInspector('10.0.0.1/32', fallback)(request)
    expect(handleFallback).not.toBeCalled()
  })

  test('not matched with allowedIp', () => {
    const request = {
      ip: '10.0.0.2'
    } as NextRequest
    makeIPInspector('10.0.0.1/32', fallback)(request)
    expect(handleFallback).toBeCalledWith(
      {
        type: 'redirect',
        destination: '/foo'
      },
      request,
      undefined
    )
  })

  it('must work with IP array', () => {
    const request = {
      ip: '11.0.0.1'
    } as NextRequest
    makeIPInspector(['11.0.0.1/32', '10.0.0.1/32'], fallback)(request)
    expect(handleFallback).not.toBeCalled()
  })

  test('does not have IP', () => {
    const request = {
      ip: ''
    } as NextRequest
    makeIPInspector('10.0.0.1/32', fallback)(request)
    expect(handleFallback).toBeCalledWith(fallback, request, undefined)
  })

  test('IP cidr', () => {
    makeIPInspector(
      ['11.0.0.0/16', '10.0.0.1/32'],
      fallback
    )({
      ip: '11.0.255.255'
    } as NextRequest)
    expect(handleFallback).not.toBeCalled()

    makeIPInspector(
      ['11.0.0.0/16', '10.0.0.1/32'],
      fallback
    )({
      ip: '11.1.255.255'
    } as NextRequest)
    expect(handleFallback).toBeCalledWith(
      fallback,
      {
        ip: '11.1.255.255'
      },
      undefined
    )
  })
})
