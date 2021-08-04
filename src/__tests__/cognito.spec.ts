import { verifyCognitoAuthenticatedUser } from '../cognito'
import { GetServerSidePropsContext } from 'next'
import { withSSRContext } from 'aws-amplify'

jest.mock('aws-amplify', () => ({
  withSSRContext: jest.fn()
}))

describe('verifyCognitoAuthenticatedUser', () => {
  test('when authenticated', () => {
    ;(withSSRContext as jest.Mock).mockReturnValue({
      Auth: { currentAuthenticatedUser: async () => ({ username: 'foo' }) }
    })
    return verifyCognitoAuthenticatedUser({} as GetServerSidePropsContext).then(
      (res) => {
        expect(res).toEqual(true)
      }
    )
  })
  test('when Not authenticated', () => {
    ;(withSSRContext as jest.Mock).mockReturnValue({
      Auth: {
        currentAuthenticatedUser: async () => {
          throw new Error()
        }
      }
    })
    return verifyCognitoAuthenticatedUser({} as GetServerSidePropsContext).then(
      (res) => {
        expect(res).toEqual(false)
      }
    )
  })
})
