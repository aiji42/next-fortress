import { makeAuth0Inspector } from '../auth0'
import { handleFallback } from '../handle-fallback'
import { Fallback } from '../types'
import { NextRequest } from 'next/server'
import fetchMock from 'fetch-mock'

jest.mock('../handle-fallback', () => ({
  handleFallback: jest.fn()
}))

fetchMock
  .get('/api/auth/me', {
    status: 200
  })
  .get('/api/auth/failed/me', {
    status: 403
  })

const fallback: Fallback = { type: 'redirect', destination: '/foo' }

const headers = {
  get: () => ''
}

describe('makeAuth0Inspector', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('not logged in', async () => {
    await makeAuth0Inspector(
      fallback,
      '/api/auth/failed/me'
    )({ headers } as unknown as NextRequest)

    expect(handleFallback).toBeCalledWith(fallback, { headers }, undefined)
  })

  test('does not have cookie', async () => {
    const noCookieReq = {
      headers: { get: () => undefined }
    } as unknown as NextRequest
    await makeAuth0Inspector(fallback, '/api/auth/failed/me')(noCookieReq)

    expect(handleFallback).toBeCalledWith(fallback, noCookieReq, undefined)
  })

  test('logged in', async () => {
    await makeAuth0Inspector(
      fallback,
      '/api/auth/me'
    )({ headers } as unknown as NextRequest)

    expect(handleFallback).not.toBeCalled()
  })
})
