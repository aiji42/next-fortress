import { vi, describe, beforeEach, test, expect, Mock } from 'vitest'
import { makeFirebaseInspector } from '../firebase'
import { NextFetchEvent, NextRequest } from 'next/server'
import { handleFallback } from '../handle-fallback'
import { Fallback } from '../types'
import fetchMock from 'fetch-mock'
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

const event = {} as NextFetchEvent

const fallback: Fallback = { type: 'redirect', destination: '/foo' }

const originalEnv = { ...process.env }

describe('makeFirebaseInspector', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env = originalEnv
  })

  test('has no cookies', async () => {
    await makeFirebaseInspector(fallback)({ cookies: {} } as NextRequest, event)

    expect(handleFallback).toBeCalledWith(fallback, { cookies: {} }, event)
  })

  test('has the firebase cookie', async () => {
    ;(decodeProtectedHeader as Mock).mockReturnValue({
      kid: 'kid1'
    })
    ;(jwtVerify as Mock).mockReturnValue(
      new Promise((resolve) => resolve(true))
    )
    await makeFirebaseInspector(fallback)(
      {
        cookies: {
          __fortressFirebaseSession: 'x.x.x'
        }
      } as unknown as NextRequest,
      event
    )

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
    await makeFirebaseInspector(fallback)(
      {
        cookies: {
          session: 'x.x.x'
        }
      } as unknown as NextRequest,
      event
    )

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
    await makeFirebaseInspector(
      fallback,
      (res) => res.firebase.sign_in_provider === 'google.com'
    )(
      {
        cookies: {
          __fortressFirebaseSession: 'x.x.x'
        }
      } as unknown as NextRequest,
      event
    )

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
    await makeFirebaseInspector(fallback)(
      {
        cookies: {
          __fortressFirebaseSession: token
        }
      } as unknown as NextRequest,
      event
    )

    expect(handleFallback).toBeCalledWith(
      fallback,
      {
        cookies: {
          __fortressFirebaseSession: token
        }
      },
      event
    )
  })

  test('jwks expired.', async () => {
    ;(decodeProtectedHeader as Mock).mockReturnValue({
      kid: 'kid3'
    })
    const token = 'x.y.z'
    await makeFirebaseInspector(fallback)(
      {
        cookies: {
          __fortressFirebaseSession: token
        }
      } as unknown as NextRequest,
      event
    )

    expect(handleFallback).toBeCalledWith(
      fallback,
      {
        cookies: {
          __fortressFirebaseSession: token
        }
      },
      event
    )
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
    await makeFirebaseInspector(fallback)(
      {
        cookies: {
          __fortressFirebaseSession: token
        }
      } as unknown as NextRequest,
      event
    )

    expect(handleFallback).not.toBeCalled()
    expect(importX509).toBeCalledWith('zzzzzzzzzz', 'RS256')
  })
})
