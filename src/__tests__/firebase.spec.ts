import { makeFirebaseInspector } from '../firebase'
import { NextRequest } from 'next/server'
import { handleFallback } from '../handle-fallback'
import { Fallback } from '../types'
import { Auth } from 'firebase-admin/lib/auth'

jest.mock('../handle-fallback', () => ({
  handleFallback: jest.fn()
}))

const fallback: Fallback = { type: 'redirect', destination: '/foo' }

describe('makeFirebaseInspector', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('has no cookies', async () => {
    const mockAuth = () => ({
      verifyIdToken: async () => {
        // no-op
      }
    })
    await makeFirebaseInspector(
      mockAuth() as unknown as Auth,
      fallback
    )({ cookies: {} } as NextRequest)

    expect(handleFallback).toBeCalledWith(fallback, { cookies: {} }, undefined)
  })

  test('has the firebase cookie', async () => {
    const mockAuth = () => ({
      verifyIdToken: async () => {
        // no-op
      }
    })
    await makeFirebaseInspector(
      mockAuth() as unknown as Auth,
      fallback
    )({
      cookies: { __fortressFirebaseSession: 'xxx' }
    } as unknown as NextRequest)

    expect(handleFallback).not.toBeCalled()
  })

  test("has the firebase cookie, but it's not valid.", async () => {
    const mockAuth = () => ({
      verifyIdToken: async () => {
        throw new Error()
      }
    })
    await makeFirebaseInspector(
      mockAuth() as unknown as Auth,
      fallback
    )({
      cookies: { __fortressFirebaseSession: 'xxx' }
    } as unknown as NextRequest)

    expect(handleFallback).toBeCalledWith(
      fallback,
      { cookies: { __fortressFirebaseSession: 'xxx' } },
      undefined
    )
  })
})
