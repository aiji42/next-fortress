import { makeFirebaseInspector } from '../firebase'
import { NextRequest } from 'next/server'
import { handleFallback } from '../handle-fallback'
import { Fallback } from '../types'
import fetchMock from 'fetch-mock'
import { decodeProtectedHeader, jwtVerify } from 'jose'

jest.mock('jose', () => ({
  importJWK: jest.fn(),
  decodeProtectedHeader: jest.fn(),
  jwtVerify: jest.fn()
}))

fetchMock.get(
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
  {
    status: 200,
    body: {
      keys: [
        {
          kid: 'kid1',
          n: 'n2',
          kty: 'RSA',
          use: 'sig',
          e: 'AQAB',
          alg: 'RS256'
        },
        {
          kid: 'kid2',
          n: 'n2',
          kty: 'RSA',
          use: 'sig',
          e: 'AQAB',
          alg: 'RS256'
        }
      ]
    }
  }
)

jest.mock('../handle-fallback', () => ({
  handleFallback: jest.fn()
}))

const fallback: Fallback = { type: 'redirect', destination: '/foo' }

describe('makeFirebaseInspector', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('has no cookies', async () => {
    await makeFirebaseInspector(fallback)({ cookies: {} } as NextRequest)

    expect(handleFallback).toBeCalledWith(fallback, { cookies: {} }, undefined)
  })

  test('has the firebase cookie', async () => {
    ;(decodeProtectedHeader as jest.Mock).mockReturnValue({
      kid: 'kid1'
    })
    ;(jwtVerify as jest.Mock).mockReturnValue(
      new Promise((resolve) => resolve(true))
    )
    await makeFirebaseInspector(fallback)({
      cookies: {
        __fortressFirebaseSession: 'x.x.x'
      }
    } as unknown as NextRequest)

    expect(handleFallback).not.toBeCalled()
  })

  test("has the firebase cookie, but it's not valid.", async () => {
    ;(decodeProtectedHeader as jest.Mock).mockReturnValue({
      kid: 'kid1'
    })
    ;(jwtVerify as jest.Mock).mockReturnValue(
      new Promise((resolve, reject) => reject(false))
    )
    const token = 'x.y.z'
    await makeFirebaseInspector(fallback)({
      cookies: {
        __fortressFirebaseSession: token
      }
    } as unknown as NextRequest)

    expect(handleFallback).toBeCalledWith(
      fallback,
      {
        cookies: {
          __fortressFirebaseSession: token
        }
      },
      undefined
    )
  })

  test('jwks expired.', async () => {
    ;(decodeProtectedHeader as jest.Mock).mockReturnValue({
      kid: 'kid3'
    })
    const token = 'x.y.z'
    await makeFirebaseInspector(fallback)({
      cookies: {
        __fortressFirebaseSession: token
      }
    } as unknown as NextRequest)

    expect(handleFallback).toBeCalledWith(
      fallback,
      {
        cookies: {
          __fortressFirebaseSession: token
        }
      },
      undefined
    )
  })
})
