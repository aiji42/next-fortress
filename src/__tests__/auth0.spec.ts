import { makeAuth0Inspector } from '../auth0'
import { handleFallback } from '../handle-fallback'
import { Fallback } from '../types'
import { NextRequest } from 'next/server'

jest.mock('../handle-fallback', () => ({
  handleFallback: jest.fn()
}))

const fallback: Fallback = { type: 'redirect', destination: '/foo' }

describe('makeAuth0Inspector', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('this is dummy test fallback route', async () => {
    await makeAuth0Inspector(fallback)(null as unknown as NextRequest)

    expect(handleFallback).toBeCalledWith(fallback, null, undefined)
  })

  test('this is dummy test access allowed route', async () => {
    await makeAuth0Inspector(fallback)({} as NextRequest)

    expect(handleFallback).not.toBeCalled()
  })
})
