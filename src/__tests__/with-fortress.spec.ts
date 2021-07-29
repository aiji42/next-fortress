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
      fortHost: '0.0.0.0',
      forts: [{ inspectBy: 'ip', ips: '', mode: 'block', source: '/' }]
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
})
