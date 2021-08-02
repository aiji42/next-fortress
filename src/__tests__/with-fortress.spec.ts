import { withFortress } from '../with-fortress'

jest.mock('../prepare-fortress-inspect', () => ({
  prepareFortressInspect: jest.fn()
}))

describe('withFortress', () => {
  test('default', () => {
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
    return config.rewrites?.().then((rule) => {
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
        }
      ],
      firebase: {
        clientEmail: 'example@example.com',
        privateKey: 'private_key',
        projectId: 'project_id'
      }
    })({})

    expect(config.serverRuntimeConfig).toEqual({
      forts: [
        {
          source: '/need/auth',
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
})
