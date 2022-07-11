import { vi, describe, beforeEach, test, expect, Mock } from 'vitest'
import { makeCognitoInspector } from '../cognito'
import { NextFetchEvent, NextRequest } from 'next/server'
import { handleFallback } from '../handle-fallback'
import { Fallback } from '../types'
import { decodeProtectedHeader, jwtVerify } from 'jose'
import fetchMock from 'fetch-mock'

vi.mock('jose', () => ({
  importJWK: vi.fn(),
  decodeProtectedHeader: vi.fn(),
  jwtVerify: vi.fn()
}))

fetchMock.get(
  'https://cognito-idp.ap-northeast-1.amazonaws.com/xxx/.well-known/jwks.json',
  {
    status: 200,
    body: {
      keys: [
        {
          alg: 'RS256',
          e: 'AQAB',
          kid: 'kid1',
          kty: 'RSA',
          n: 'n1',
          use: 'sig'
        },
        {
          alg: 'RS256',
          e: 'AQAB',
          kid: 'kid',
          kty: 'RSA',
          n: 'n2',
          use: 'sig'
        }
      ]
    }
  }
)

const cognitoParams = {
  region: 'ap-northeast-1',
  userPoolId: 'xxx',
  userPoolWebClientId: 'yyy'
}

vi.mock('../handle-fallback', () => ({
  handleFallback: vi.fn()
}))

const fallback: Fallback = { type: 'redirect', destination: '/foo' }

const event = {} as NextFetchEvent

describe('makeCognitoInspector', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  test('has no cookies', async () => {
    await makeCognitoInspector(fallback, cognitoParams)(
      { cookies: {} } as NextRequest,
      event
    )

    expect(handleFallback).toBeCalledWith(fallback, { cookies: {} }, event)
  })

  test('has the firebase cookie', async () => {
    ;(decodeProtectedHeader as Mock).mockReturnValue({
      kid: 'kid1'
    })
    ;(jwtVerify as Mock).mockReturnValue(
      new Promise((resolve) => resolve(true))
    )
    await makeCognitoInspector(fallback, cognitoParams)(
      {
        cookies: {
          'CognitoIdentityServiceProvider.yyy.userName.idToken': 'x.x.x'
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
            email_verified: true
          }
        })
      )
    )
    await makeCognitoInspector(
      fallback,
      cognitoParams,
      (res) => !!res.email_verified
    )(
      {
        cookies: {
          'CognitoIdentityServiceProvider.yyy.userName.idToken': 'x.x.x'
        }
      } as unknown as NextRequest,
      event
    )

    expect(handleFallback).not.toBeCalled()
  })

  test("has the cognito cookie, but it's not valid.", async () => {
    ;(decodeProtectedHeader as Mock).mockReturnValue({
      kid: 'kid1'
    })
    ;(jwtVerify as Mock).mockReturnValue(
      new Promise((resolve, reject) => reject(false))
    )
    const token = 'x.y.z'
    await makeCognitoInspector(fallback, cognitoParams)(
      {
        cookies: {
          'CognitoIdentityServiceProvider.yyy.userName.idToken': token
        }
      } as unknown as NextRequest,
      event
    )

    expect(handleFallback).toBeCalledWith(
      fallback,
      {
        cookies: {
          'CognitoIdentityServiceProvider.yyy.userName.idToken': token
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
    await makeCognitoInspector(fallback, cognitoParams)(
      {
        cookies: {
          'CognitoIdentityServiceProvider.yyy.userName.idToken': token
        }
      } as unknown as NextRequest,
      event
    )

    expect(handleFallback).toBeCalledWith(
      fallback,
      {
        cookies: {
          'CognitoIdentityServiceProvider.yyy.userName.idToken': token
        }
      },
      event
    )
  })
})
