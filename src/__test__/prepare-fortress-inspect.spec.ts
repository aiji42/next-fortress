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
    prepareFortressInspect()
    expect(mkdirSync).toBeCalled()
    expect(writeFileSync).toBeCalledWith(
      'pages/_fortress/[__key].js',
      `export { getServerSideProps } from 'next-fortress/build/inspect'
const Inspect = () => null
export default Inspect
`
    )
  })
  it('must not call mkdirSync when existing directory', () => {
    ;(findPagesDir as jest.Mock).mockReturnValue('pages')
    ;(existsSync as jest.Mock).mockReturnValue(true)
    prepareFortressInspect()
    expect(mkdirSync).not.toBeCalled()
  })
  it('must not call mkdirSync when already prepared', () => {
    ;(findPagesDir as jest.Mock).mockReturnValue('pages')
    ;(existsSync as jest.Mock).mockReturnValue(true)
    prepareFortressInspect(true)
    expect(mkdirSync).not.toBeCalled()
  })
  it('must not work when inspect file is existing', () => {
    prepareFortressInspect()
    expect(writeFileSync).not.toBeCalled()
    ;(existsSync as jest.Mock).mockImplementation((path: string) =>
      path.includes('[__key].ts')
    )
    prepareFortressInspect()
    expect(writeFileSync).not.toBeCalled()
    ;(existsSync as jest.Mock).mockImplementation((path: string) =>
      path.includes('[__key].tsx')
    )
    prepareFortressInspect()
    expect(writeFileSync).not.toBeCalled()
    ;(existsSync as jest.Mock).mockImplementation((path: string) =>
      path.includes('[__key].js')
    )
    prepareFortressInspect()
    expect(writeFileSync).not.toBeCalled()
    ;(existsSync as jest.Mock).mockImplementation((path: string) =>
      path.includes('[__key].jsx')
    )
    prepareFortressInspect()
    expect(writeFileSync).not.toBeCalled()
  })
  it('must request a self-creation when an exception is raised', () => {
    ;(findPagesDir as jest.Mock).mockImplementation(() => {
      throw new Error('some error.')
    })
    prepareFortressInspect()
    expect(writeFileSync).not.toBeCalled()
    expect(mockExit).toBeCalledWith(1)
  })
})
