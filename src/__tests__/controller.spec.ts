import { controller } from '../controller'
import { runReverseProxy } from '../run-reverse-proxy'
import { GetServerSidePropsContext } from 'next'
import { Inspector } from '../inspector'

jest.mock('../run-reverse-proxy', () => ({
  runReverseProxy: jest.fn()
}))

jest.mock('next/config', () => () => ({
  serverRuntimeConfig: {
    forts: [
      {
        mode: 'redirect',
        destination: '/redirected',
        inspectBy: 'firebase',
        source: '/origin'
      },
      { mode: 'block', inspectBy: 'firebase', source: '/origin' },
      {
        mode: 'rewrite',
        inspectBy: 'firebase',
        source: '/origin',
        destination: '/rewritten'
      }
    ],
    fortress: {
      host: 'host'
    }
  }
}))

describe('controller', () => {
  test('allow to access origin', () => {
    return controller(
      { exec: async () => true } as unknown as Inspector,
      {} as GetServerSidePropsContext
    ).then((res) => {
      expect(res).toEqual({ props: {} })
      expect(runReverseProxy).toBeCalledWith({}, 'host')
    })
  })

  test('deny by redirect', () => {
    return controller(
      { exec: async () => false } as unknown as Inspector,
      { query: { __key: '0' } } as unknown as GetServerSidePropsContext
    ).then((res) => {
      expect(res).toEqual({
        redirect: { destination: '/redirected', statusCode: 302 }
      })
    })
  })

  test('deny by block', () => {
    const writeHead = jest.fn().mockReturnValue({
      end: jest.fn()
    })
    return controller(
      { exec: async () => false } as unknown as Inspector,
      {
        res: { writeHead },
        query: { __key: '1' }
      } as unknown as GetServerSidePropsContext
    ).then((res) => {
      expect(res).toEqual({ props: {} })
      expect(writeHead).toBeCalledWith(400)
    })
  })

  test('deny by rewrite', () => {
    return controller(
      { exec: async () => false } as unknown as Inspector,
      { query: { __key: '2' } } as unknown as GetServerSidePropsContext
    ).then((res) => {
      expect(res).toEqual({ props: {} })
      expect(runReverseProxy).toBeCalledWith(
        { query: { __key: '2' } },
        'host',
        {
          mode: 'rewrite',
          inspectBy: 'firebase',
          source: '/origin',
          destination: '/rewritten'
        }
      )
    })
  })
})
