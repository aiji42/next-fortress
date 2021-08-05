import { Inspector } from '../inspector'
import { GetServerSidePropsContext } from 'next'

jest.mock('next/config', () => () => ({
  serverRuntimeConfig: { forts: [] }
}))

describe('Inspector', () => {
  test('All operators return false', () => {
    const inspector = new Inspector()
      .add(async () => false)
      .add(async () => false)
      .add(async () => false)
    return inspector
      .exec({ query: { __key: '0' } } as unknown as GetServerSidePropsContext)
      .then((res) => expect(res).toEqual(false))
  })

  test('A operator return true', () => {
    const inspector = new Inspector()
      .add(async () => true)
      .add(async () => false)
      .add(async () => false)
    return inspector
      .exec({ query: { __key: '0' } } as unknown as GetServerSidePropsContext)
      .then((res) => expect(res).toEqual(true))
  })
})
