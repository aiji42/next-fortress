import { prepareFortressInspect } from '../prepare-fortress-inspect'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { findPagesDir } from 'next/dist/lib/find-pages-dir'

jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn()
}))

jest.mock('next/dist/lib/find-pages-dir', () => ({
  findPagesDir: jest.fn()
}))

jest.spyOn(console, 'error').mockImplementation((mes) => console.log(mes))

const mockExit = jest
  .spyOn(process, 'exit')
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  .mockImplementation((code) => console.log('exit: ', code))

describe('prepareFortressInspect', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('must make fortress-inspect script', () => {
    ;(findPagesDir as jest.Mock).mockReturnValue('pages')
    ;(existsSync as jest.Mock).mockReturnValue(false)
    prepareFortressInspect(['ip'])
    expect(mkdirSync).toBeCalled()
    expect(writeFileSync).toBeCalledWith(
      'pages/_fortress/[__key].js',
      `import { Inspector } from 'next-fortress/build/inspector'
import { controller } from 'next-fortress/build/controller'
import { ip } from 'next-fortress/build/ip'
const inspector = new Inspector().add(ip)
export const getServerSideProps = async (ctx) => {
  return controller(inspector, ctx)
}
const Fortress = () => null
export default Fortress
`
    )
  })
  it('must not call mkdirSync when existing directory', () => {
    ;(findPagesDir as jest.Mock).mockReturnValue('pages')
    ;(existsSync as jest.Mock).mockReturnValue(true)
    prepareFortressInspect([])
    expect(mkdirSync).not.toBeCalled()
  })
  it('must not call mkdirSync when already prepared', () => {
    ;(findPagesDir as jest.Mock).mockReturnValue('pages')
    ;(existsSync as jest.Mock).mockReturnValue(true)
    prepareFortressInspect([], true)
    expect(mkdirSync).not.toBeCalled()
  })
  it('must not work when inspect file is existing', () => {
    ;(existsSync as jest.Mock).mockImplementation((path: string) =>
      path.includes('[__key].ts')
    )
    prepareFortressInspect(['ip'])
    expect(writeFileSync).toBeCalledWith(
      'pages/_fortress/[__key].ts',
      `import { Inspector } from 'next-fortress/build/inspector'
import { controller } from 'next-fortress/build/controller'
import { GetServerSideProps } from 'next'
import { ip } from 'next-fortress/build/ip'
const inspector = new Inspector().add(ip)
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return controller(inspector, ctx)
}
const Fortress = () => null
export default Fortress
`
    )
    ;(existsSync as jest.Mock).mockImplementation((path: string) =>
      path.includes('[__key].tsx')
    )
    prepareFortressInspect(['ip'])
    expect(writeFileSync).toBeCalledWith(
      'pages/_fortress/[__key].tsx',
      `import { Inspector } from 'next-fortress/build/inspector'
import { controller } from 'next-fortress/build/controller'
import { GetServerSideProps } from 'next'
import { ip } from 'next-fortress/build/ip'
const inspector = new Inspector().add(ip)
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return controller(inspector, ctx)
}
const Fortress = () => null
export default Fortress
`
    )
    ;(existsSync as jest.Mock).mockImplementation((path: string) =>
      path.includes('[__key].js')
    )
    prepareFortressInspect(['ip'])
    expect(writeFileSync).toBeCalledWith(
      'pages/_fortress/[__key].js',
      `import { Inspector } from 'next-fortress/build/inspector'
import { controller } from 'next-fortress/build/controller'
import { ip } from 'next-fortress/build/ip'
const inspector = new Inspector().add(ip)
export const getServerSideProps = async (ctx) => {
  return controller(inspector, ctx)
}
const Fortress = () => null
export default Fortress
`
    )
    ;(existsSync as jest.Mock).mockImplementation((path: string) =>
      path.includes('[__key].jsx')
    )
    prepareFortressInspect(['ip'])
    expect(writeFileSync).toBeCalledWith(
      'pages/_fortress/[__key].jsx',
      `import { Inspector } from 'next-fortress/build/inspector'
import { controller } from 'next-fortress/build/controller'
import { ip } from 'next-fortress/build/ip'
const inspector = new Inspector().add(ip)
export const getServerSideProps = async (ctx) => {
  return controller(inspector, ctx)
}
const Fortress = () => null
export default Fortress
`
    )
  })

  it('must request a self-creation when an exception is raised', () => {
    ;(findPagesDir as jest.Mock).mockImplementation(() => {
      throw new Error('some error.')
    })
    prepareFortressInspect([])
    expect(writeFileSync).not.toBeCalled()
    expect(mockExit).toBeCalledWith(1)
  })
})
