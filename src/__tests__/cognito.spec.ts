import { makeCognitoInspector } from '../cognito'
import { NextRequest } from 'next/server'
import { handleFallback } from '../handle-fallback'
import { Fallback } from '../types'
import { decodeProtectedHeader, jwtVerify } from 'jose'
import fetchMock from 'fetch-mock'

jest.mock('jose', () => ({
  importJWK: jest.fn(),
  decodeProtectedHeader: jest.fn(),
  jwtVerify: jest.fn()
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

jest.mock('../handle-fallback', () => ({
  handleFallback: jest.fn()
}))

const fallback: Fallback = { type: 'redirect', destination: '/foo' }

describe('makeCognitoInspector', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('has no cookies', async () => {
    await makeCognitoInspector(
      fallback,
      'ap-northeast-1',
      'xxx'
    )({ cookies: {} } as NextRequest)

    expect(handleFallback).toBeCalledWith(fallback, { cookies: {} }, undefined)
  })

  test('has the firebase cookie', async () => {
    ;(decodeProtectedHeader as jest.Mock).mockReturnValue({
      kid: 'kid1'
    })
    ;(jwtVerify as jest.Mock).mockReturnValue(
      new Promise((resolve) => resolve(true))
    )
    await makeCognitoInspector(
      fallback,
      'ap-northeast-1',
      'xxx'
    )({
      cookies: {
        'CognitoIdentityServiceProvider.xxx.idToken': 'x.x.x'
      }
    } as unknown as NextRequest)

    expect(handleFallback).not.toBeCalled()
  })

  test("has the cognito cookie, but it's not valid.", async () => {
    ;(decodeProtectedHeader as jest.Mock).mockReturnValue({
      kid: 'kid1'
    })
    ;(jwtVerify as jest.Mock).mockReturnValue(
      new Promise((resolve, reject) => reject(false))
    )
    const token = 'x.y.z'
    await makeCognitoInspector(
      fallback,
      'ap-northeast-1',
      'xxx'
    )({
      cookies: {
        'CognitoIdentityServiceProvider.xxx.idToken': token
      }
    } as unknown as NextRequest)

    expect(handleFallback).toBeCalledWith(
      fallback,
      {
        cookies: {
          'CognitoIdentityServiceProvider.xxx.idToken': token
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
    await makeCognitoInspector(
      fallback,
      'ap-northeast-1',
      'xxx'
    )({
      cookies: {
        'CognitoIdentityServiceProvider.xxx.idToken': token
      }
    } as unknown as NextRequest)

    expect(handleFallback).toBeCalledWith(
      fallback,
      {
        cookies: {
          'CognitoIdentityServiceProvider.xxx.idToken': token
        }
      },
      undefined
    )
  })
})
