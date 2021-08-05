import { verifyCognitoAuthenticatedUser, cognito } from '../cognito'
import { GetServerSidePropsContext } from 'next'
import { withSSRContext } from 'aws-amplify'
import { Fort } from '../types'

jest.mock('aws-amplify', () => ({
  withSSRContext: jest.fn()
}))

describe('cognito', () => {
  describe('verifyCognitoAuthenticatedUser', () => {
    test('when authenticated', () => {
      ;(withSSRContext as jest.Mock).mockReturnValue({
        Auth: { currentAuthenticatedUser: async () => ({ username: 'foo' }) }
      })
      return verifyCognitoAuthenticatedUser(
        {} as GetServerSidePropsContext
      ).then((res) => {
        expect(res).toEqual(true)
      })
    })
    test('when Not authenticated', () => {
      ;(withSSRContext as jest.Mock).mockReturnValue({
        Auth: {
          currentAuthenticatedUser: async () => {
            throw new Error()
          }
        }
      })
      return verifyCognitoAuthenticatedUser(
        {} as GetServerSidePropsContext
      ).then((res) => {
        expect(res).toEqual(false)
      })
    })
  })

  describe('cognito', () => {
    test('"inspectBy" is not "cognito"', () => {
      return cognito(
        { inspectBy: 'firebase' } as Fort,
        {} as GetServerSidePropsContext
      ).then((res) => {
        expect(res).toEqual(false)
      })
    })
    test('"inspectBy" is "cognito"', () => {
      ;(withSSRContext as jest.Mock).mockReturnValue({
        Auth: { currentAuthenticatedUser: async () => ({ username: 'foo' }) }
      })
      return cognito(
        { inspectBy: 'cognito' } as Fort,
        {} as GetServerSidePropsContext
      ).then((res) => {
        expect(res).toEqual(true)
      })
    })
  })
})
