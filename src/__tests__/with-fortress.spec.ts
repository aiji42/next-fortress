import { withFortress } from '../with-fortress'
import { prepareFortressInspect } from '../prepare-fortress-inspect'

jest.mock('../prepare-fortress-inspect', () => ({
  prepareFortressInspect: jest.fn()
}))

describe('withFortress', () => {
  test('default', async () => {
    const config = withFortress({
      forts: [
        {
          source: '/',
          inspectBy: 'ip',
          ips: '',
          mode: 'block'
        }
      ]
    })({})

    expect(config.serverRuntimeConfig).toEqual({
      forts: [{ inspectBy: 'ip', ips: '', mode: 'block', source: '/' }],
      fortress: {
        host: '0.0.0.0',
        firebase: undefined
      }
    })
    expect(prepareFortressInspect).toBeCalledWith(['ip'], false)
    await config.rewrites?.().then((rule) => {
      expect(rule).toEqual({
        beforeFiles: [
          {
            destination: '/_fortress/0',
            has: [{ key: 'user-agent', type: 'header' }],
            source: '/'
          }
        ]
      })
    })
  })

  test('inspectByFirebase', () => {
    const config = withFortress({
      forts: [
        {
          source: '/need/auth',
          inspectBy: 'firebase',
          mode: 'redirect',
          destination: '/login'
        },
        {
          source: '/need/auth2',
          inspectBy: 'firebase',
          mode: 'redirect',
          destination: '/login'
        }
      ],
      firebase: {
        clientEmail: 'example@example.com',
        privateKey: 'private_key',
        projectId: 'project_id'
      },
      prepared: true
    })({})

    expect(prepareFortressInspect).toBeCalledWith(['firebase'], true)
    expect(config.serverRuntimeConfig).toEqual({
      forts: [
        {
          source: '/need/auth',
          inspectBy: 'firebase',
          mode: 'redirect',
          destination: '/login'
        },
        {
          source: '/need/auth2',
          inspectBy: 'firebase',
          mode: 'redirect',
          destination: '/login'
        }
      ],
      fortress: {
        host: '0.0.0.0',
        firebase: {
          clientEmail: 'example@example.com',
          privateKey: 'private_key',
          projectId: 'project_id'
        }
      }
    })
  })

  test('inspectByCustom', () => {
    const config = withFortress({
      forts: [
        {
          source: '/need/auth',
          inspectBy: 'custom',
          mode: 'redirect',
          destination: '/login'
        }
      ]
    })({})

    expect(prepareFortressInspect).toBeCalledWith([], false)
    expect(config.serverRuntimeConfig).toEqual({
      forts: [
        {
          source: '/need/auth',
          inspectBy: 'custom',
          mode: 'redirect',
          destination: '/login'
        }
      ],
      fortress: {
        host: '0.0.0.0'
      }
    })
  })
})
