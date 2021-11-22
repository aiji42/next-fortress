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
    status: 200,
    body: {
      email_verified: true
    }
  })
  .get('/api/auth/failed/me', {
    status: 401
  })
  .get('https://authed.com/api/auth/me', {
    status: 200,
    body: {
      email_verified: true
    }
  })
  .get('https://not.authed.com/api/auth/me', {
    status: 401
  })

const fallback: Fallback = { type: 'redirect', destination: '/foo' }

const headers = {
  get: () => ''
}

describe('makeAuth0Inspector', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('dose not have nextUrl origin', () => {
    test('not logged in', async () => {
      const req = { headers, nextUrl: { origin: '' } } as unknown as NextRequest
      await makeAuth0Inspector(fallback, '/api/auth/failed/me')(req)

      expect(handleFallback).toBeCalledWith(fallback, req, undefined)
    })

    test('does not have cookie', async () => {
      const noCookieReq = {
        headers: { get: () => undefined },
        nextUrl: { origin: '' }
      } as unknown as NextRequest
      await makeAuth0Inspector(fallback, '/api/auth/failed/me')(noCookieReq)

      expect(handleFallback).toBeCalledWith(fallback, noCookieReq, undefined)
    })

    test('logged in', async () => {
      await makeAuth0Inspector(
        fallback,
        '/api/auth/me'
      )({ headers, nextUrl: { origin: '' } } as unknown as NextRequest)

      expect(handleFallback).not.toBeCalled()
    })

    test('the domain of api endpoint is specified', async () => {
      const req = { headers, nextUrl: { origin: '' } } as unknown as NextRequest
      await makeAuth0Inspector(
        fallback,
        'https://not.authed.com/api/auth/me'
      )(req)

      expect(handleFallback).toBeCalledWith(fallback, req, undefined)
    })

    test('logged in and passed custom handler', async () => {
      await makeAuth0Inspector(
        fallback,
        '/api/auth/me',
        (res) => !!res.email_verified
      )({ headers, nextUrl: { origin: '' } } as unknown as NextRequest)

      expect(handleFallback).not.toBeCalled()
    })
  })

  describe('has nextUrl origin', () => {
    test('not logged in', async () => {
      const req = {
        headers,
        nextUrl: { origin: 'https://not.authed.com' }
      } as unknown as NextRequest
      await makeAuth0Inspector(fallback, '/api/auth/me')(req)

      expect(handleFallback).toBeCalledWith(fallback, req, undefined)
    })

    test('logged in', async () => {
      await makeAuth0Inspector(
        fallback,
        '/api/auth/me'
      )({
        headers,
        nextUrl: { origin: 'https://authed.com' }
      } as unknown as NextRequest)

      expect(handleFallback).not.toBeCalled()
    })
  })
})
