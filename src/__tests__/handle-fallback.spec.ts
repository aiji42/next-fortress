import { vi, describe, beforeEach, test, expect } from 'vitest'
import { handleFallback } from '../handle-fallback'
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'

vi.mock('next/server', () => ({
  NextResponse: vi.fn()
}))

const dummyRequest = {
  nextUrl: {
    pathname: '/',
    clone: () => ({
      pathname: '/'
    })
  }
} as NextRequest
const dummyEvent = {} as NextFetchEvent

describe('handleFallback', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  test('passed function', () => {
    const fallback = vi.fn()
    handleFallback(fallback, dummyRequest, dummyEvent)

    expect(fallback).toBeCalledWith(dummyRequest, dummyEvent)
  })

  test('handle preflight', () => {
    NextResponse.redirect = vi.fn()
    handleFallback(
      { type: 'redirect', destination: '/foo/bar' },
      { ...dummyRequest, method: 'OPTIONS' } as unknown as NextRequest,
      dummyEvent
    )
    expect(NextResponse.redirect).not.toBeCalled()
    expect(NextResponse).toBeCalledWith(null)
  })

  test('passed redirect option', () => {
    NextResponse.redirect = vi.fn()
    handleFallback(
      { type: 'redirect', destination: '/foo/bar' },
      dummyRequest,
      dummyEvent
    )
    expect(NextResponse.redirect).toBeCalledWith(
      { pathname: '/foo/bar' },
      undefined
    )

    handleFallback(
      { type: 'redirect', destination: '/foo/baz', statusCode: 301 },
      dummyRequest,
      dummyEvent
    )
    expect(NextResponse.redirect).toBeCalledWith({ pathname: '/foo/baz' }, 301)
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
    NextResponse.rewrite = vi.fn()
    handleFallback(
      { type: 'rewrite', destination: '/foo/bar' },
      dummyRequest,
      dummyEvent
    )
    expect(NextResponse.rewrite).toBeCalledWith({ pathname: '/foo/bar' })
  })
})
