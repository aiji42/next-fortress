/**
 * @vitest-environment edge-runtime
 */
import { vi, describe, beforeEach, test, expect, Mock } from 'vitest'
import { makeFirebaseInspector } from '../firebase'
import type { NextFetchEvent } from 'next/server'
const { NextRequest } = require('next/server')
import { handleFallback } from '../handle-fallback'
import { Fallback } from '../types'
import * as fetchMock from 'fetch-mock'
import { decodeProtectedHeader, jwtVerify, importX509 } from 'jose'

vi.mock('jose', () => ({
  importJWK: vi.fn(),
  decodeProtectedHeader: vi.fn(),
  jwtVerify: vi.fn(),
  importX509: vi.fn()
}))

fetchMock
  .get(
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com',
    {
      status: 200,
      body: {
        kid1: 'xxxxxxxxxx',
        kid2: 'yyyyyyyyyy'
      }
    }
  )
  .get(
    'https://www.googleapis.com/identitytoolkit/v3/relyingparty/publicKeys',
    {
      status: 200,
      body: {
        kid3: 'zzzzzzzzzz'
      }
    }
  )

vi.mock('../handle-fallback', () => ({
  handleFallback: vi.fn()
}))

const event = { waitUntil: () => {} } as unknown as NextFetchEvent

const fallback: Fallback = { type: 'redirect', destination: '/foo' }

const originalEnv = { ...process.env }

describe('makeFirebaseInspector', () => {
  beforeEach(async () => {
    vi.resetAllMocks()
    await caches.delete('cache:firebase')
    process.env = originalEnv
  })

  test('has no cookies', async () => {
    const req = new NextRequest('https://example.com')
    await makeFirebaseInspector(fallback)(req, event)

    expect(handleFallback).toBeCalledWith(fallback, req, event)
  })

  test('has the firebase cookie', async () => {
    ;(decodeProtectedHeader as Mock).mockReturnValue({
      kid: 'kid1'
    })
    ;(jwtVerify as Mock).mockReturnValue(
      new Promise((resolve) => resolve(true))
    )
    const req = new NextRequest('https://example.com')
    req.cookies.set('__fortressFirebaseSession', 'x.x.x')
    await makeFirebaseInspector(fallback)(req, event)

    expect(handleFallback).not.toBeCalled()
  })

  test('has the firebase cookie by custom key', async () => {
    process.env = {
      ...process.env,
      FORTRESS_FIREBASE_COOKIE_KEY: 'session'
    }
    ;(decodeProtectedHeader as Mock).mockReturnValue({
      kid: 'kid1'
    })
    ;(jwtVerify as Mock).mockReturnValue(
      new Promise((resolve) => resolve(true))
    )
    const req = new NextRequest('https://example.com')
    req.cookies.set('session', 'x.x.x')
    await makeFirebaseInspector(fallback)(req, event)

    expect(handleFallback).not.toBeCalled()
  })

  test('has the firebase cookie and passed custom handler', async () => {
    ;(decodeProtectedHeader as Mock).mockReturnValue({
      kid: 'kid1'
    })
    ;(jwtVerify as Mock).mockReturnValue(
      new Promise((resolve) =>
        resolve({
          payload: {
            firebase: {
              sign_in_provider: 'google.com'
            }
          }
        })
      )
    )
    const req = new NextRequest('https://example.com')
    req.cookies.set('__fortressFirebaseSession', 'x.x.x')
    await makeFirebaseInspector(
      fallback,
      (res) => res.firebase.sign_in_provider === 'google.com'
    )(req, event)

    expect(handleFallback).not.toBeCalled()
  })

  test("has the firebase cookie, but it's not valid.", async () => {
    ;(decodeProtectedHeader as Mock).mockReturnValue({
      kid: 'kid1'
    })
    ;(jwtVerify as Mock).mockReturnValue(
      new Promise((resolve, reject) => reject(false))
    )
    const token = 'x.y.z'
    const req = new NextRequest('https://example.com')
    req.cookies.set('__fortressFirebaseSession', token)
    await makeFirebaseInspector(fallback)(req, event)

    expect(handleFallback).toBeCalledWith(fallback, req, event)
  })

  test('jwks expired.', async () => {
    ;(decodeProtectedHeader as Mock).mockReturnValue({
      kid: 'kid3'
    })
    const token = 'x.y.z'
    const req = new NextRequest('https://example.com')
    req.cookies.set('__fortressFirebaseSession', token)
    await makeFirebaseInspector(fallback)(req, event)

    expect(handleFallback).toBeCalledWith(fallback, req, event)
    expect(importX509).toBeCalledWith(undefined, 'RS256')
  })

  test('session cookie mode', async () => {
    process.env = {
      ...process.env,
      FORTRESS_FIREBASE_MODE: 'session'
    }
    ;(decodeProtectedHeader as Mock).mockReturnValue({
      kid: 'kid3'
    })
    ;(jwtVerify as Mock).mockReturnValue(
      new Promise((resolve) => resolve(true))
    )
    const token = 'x.y.z'
    const req = new NextRequest('https://example.com')
    req.cookies.set('__fortressFirebaseSession', token)
    await makeFirebaseInspector(fallback)(req, event)

    expect(handleFallback).not.toBeCalled()
    expect(importX509).toBeCalledWith('zzzzzzzzzz', 'RS256')
  })
})
