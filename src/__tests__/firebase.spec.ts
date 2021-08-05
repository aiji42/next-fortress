import { verifyFirebaseIdToken, firebase } from '../firebase'
import nookies from 'nookies'
import * as firebaseAdmin from 'firebase-admin'
import { Fort } from '../types'
import { GetServerSidePropsContext } from 'next'

jest.mock('next/config', () => () => ({
  serverRuntimeConfig: {
    fortress: {
      firebase: {
        clientEmail: '',
        projectId: '',
        privateKey: ''
      }
    }
  }
}))
jest.mock('nookies', () => ({
  get: jest.fn()
}))
jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  credential: { cert: jest.fn() },
  auth: jest.fn()
}))

describe('firebase', () => {
  ;(firebaseAdmin.credential.cert as jest.Mock).mockReturnValue(null)
  describe('verifyFirebaseIdToken', () => {
    test('Not has firebase token', () => {
      ;(nookies.get as jest.Mock).mockReturnValue({})
      return verifyFirebaseIdToken({} as GetServerSidePropsContext).then(
        (res) => expect(res).toEqual(false)
      )
    })

    test('Has firebase token in cookie and firebaseAdmin returns verified token (logged in)', () => {
      ;(nookies.get as jest.Mock).mockReturnValue({ __fortressFirebase: 'foo' })
      ;(firebaseAdmin.auth as unknown as jest.Mock).mockReturnValue({
        verifyIdToken: async () => 'foo'
      })
      return verifyFirebaseIdToken({} as GetServerSidePropsContext).then(
        (res) => expect(res).toEqual(true)
      )
    })

    test('Has firebase token in cookie and firebaseAdmin throws Error (Not logged in)', () => {
      ;(nookies.get as jest.Mock).mockReturnValue({ __fortressFirebase: 'foo' })
      ;(firebaseAdmin.auth as unknown as jest.Mock).mockReturnValue({
        verifyIdToken: async () => {
          throw new Error('')
        }
      })
      return verifyFirebaseIdToken({} as GetServerSidePropsContext).then(
        (res) => expect(res).toEqual(false)
      )
    })
  })

  describe('firebase', () => {
    test('"inspectBy" is not "firebase"', () => {
      return firebase(
        { inspectBy: 'cognito' } as Fort,
        {} as GetServerSidePropsContext
      ).then((res) => {
        expect(res).toEqual(false)
      })
    })
    test('"inspectBy" is "firebase"', () => {
      ;(nookies.get as jest.Mock).mockReturnValue({ __fortressFirebase: 'foo' })
      ;(firebaseAdmin.auth as unknown as jest.Mock).mockReturnValue({
        verifyIdToken: async () => 'foo'
      })
      return firebase(
        { inspectBy: 'firebase' } as Fort,
        {} as GetServerSidePropsContext
      ).then((res) => {
        expect(res).toEqual(true)
      })
    })
  })
})
