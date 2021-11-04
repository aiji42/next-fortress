import { makeCognitoInspector } from '../cognito'
import { NextRequest } from 'next/server'
import { handleFallback } from '../handle-fallback'
import { Fallback } from '../types'
import { withSSRContext } from 'aws-amplify'

jest.mock('../handle-fallback', () => ({
  handleFallback: jest.fn()
}))

jest.mock('aws-amplify', () => ({
  withSSRContext: jest.fn()
}))

const fallback: Fallback = { type: 'redirect', destination: '/foo' }

const request = {
  headers: {
    get: () => {
      // no-op
    }
  }
} as unknown as NextRequest

describe('makeCognitoInspector', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('has no cookies (currentAuthenticatedUser does not return user)', async () => {
    ;(withSSRContext as jest.Mock).mockReturnValue({
      Auth: {
        currentAuthenticatedUser: () => {
          throw new Error()
        }
      }
    })
    await makeCognitoInspector(fallback)(request)

    expect(handleFallback).toBeCalledWith(fallback, request, undefined)
  })

  test('has the cognito cookie (currentAuthenticatedUser returns user)', async () => {
    ;(withSSRContext as jest.Mock).mockReturnValue({
      Auth: {
        currentAuthenticatedUser: () => ({})
      }
    })
    await makeCognitoInspector(fallback)(request)

    expect(handleFallback).not.toBeCalled()
  })
})
