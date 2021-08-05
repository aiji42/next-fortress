import { verifyAuth0Session, auth0 } from '../auth0'
import { GetServerSidePropsContext } from 'next'
import { getSession } from '@auth0/nextjs-auth0'
import { Fort } from '../types'

jest.mock('@auth0/nextjs-auth0', () => ({
  getSession: jest.fn()
}))

describe('auth0', () => {
  describe('verifyAuth0Session', () => {
    test('when authenticated', () => {
      ;(getSession as jest.Mock).mockReturnValue({
        user: {}
      })
      return verifyAuth0Session({} as GetServerSidePropsContext).then((res) => {
        expect(res).toEqual(true)
      })
    })
    test('when Not authenticated', () => {
      ;(getSession as jest.Mock).mockReturnValue(undefined)
      return verifyAuth0Session({} as GetServerSidePropsContext).then((res) => {
        expect(res).toEqual(false)
      })
    })
  })

  describe('auth0', () => {
    test('"inspectBy" is not "auth0"', () => {
      return auth0(
        { inspectBy: 'firebase' } as Fort,
        {} as GetServerSidePropsContext
      ).then((res) => {
        expect(res).toEqual(false)
      })
    })
    test('"inspectBy" is "auth0"', () => {
      ;(getSession as jest.Mock).mockReturnValue({
        user: {}
      })
      return auth0(
        { inspectBy: 'auth0' } as Fort,
        {} as GetServerSidePropsContext
      ).then((res) => {
        expect(res).toEqual(true)
      })
    })
  })
})
