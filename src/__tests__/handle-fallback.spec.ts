import { handleFallback } from '../handle-fallback'
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'

jest.mock('next/server', () => ({
  NextResponse: {
    rewrite: jest.fn(),
    redirect: jest.fn()
  }
}))

const dummyRequest = { nextUrl: { pathname: '/' } } as NextRequest
const dummyEvent = {} as NextFetchEvent

describe('handleFallback', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('passed function', () => {
    const fallback = jest.fn()
    handleFallback(fallback, dummyRequest, dummyEvent)

    expect(fallback).toBeCalledWith(dummyRequest, dummyEvent)
  })

  test('passed redirect option', () => {
    handleFallback(
      { type: 'redirect', destination: '/foo/bar' },
      dummyRequest,
      dummyEvent
    )
    expect(NextResponse.redirect).toBeCalledWith('/foo/bar', undefined)

    handleFallback(
      { type: 'redirect', destination: '/foo/baz', statusCode: 301 },
      dummyRequest,
      dummyEvent
    )
    expect(NextResponse.redirect).toBeCalledWith('/foo/baz', 301)
  })

  test('prevent redirection loop', () => {
    const res = handleFallback(
      { type: 'redirect', destination: '/foo/bar' },
      {
        nextUrl: { pathname: '/foo/bar' }
      } as NextRequest,
      dummyEvent
    )
    expect(res).toBeUndefined()
  })

  test('passed rewrite option', () => {
    handleFallback(
      { type: 'rewrite', destination: '/foo/bar' },
      dummyRequest,
      dummyEvent
    )
    expect(NextResponse.rewrite).toBeCalledWith('/foo/bar')
  })
})
