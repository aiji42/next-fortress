import { findPagesDir } from 'next/dist/lib/find-pages-dir'
import { writeFileSync, existsSync, mkdirSync } from 'fs'

const scriptText = (
  modules: string[]
) => `import { Inspector } from 'next-fortress/build/inspector'
import { controller } from 'next-fortress/build/controller'
${modules
  .map((m) => `import { ${m} } from 'next-fortress/build/${m}'`)
  .join('\n')}
const inspector = new Inspector()${modules.map((m) => `.add(${m})`).join('')}
export const getServerSideProps = async (ctx) => {
  return controller(inspector, ctx)
}
const Fortress = () => null
export default Fortress
`

const typeScriptText = (
  modules: string[]
) => `import { Inspector } from 'next-fortress/build/inspector'
import { controller } from 'next-fortress/build/controller'
import { GetServerSideProps } from 'next'
${modules
  .map((m) => `import { ${m} } from 'next-fortress/build/${m}'`)
  .join('\n')}
const inspector = new Inspector()${modules.map((m) => `.add(${m})`).join('')}
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return controller(inspector, ctx)
}
const Fortress = () => null
export default Fortress
`

const suggestMessage = (
  modules: string[]
) => `> Could not create the necessary file to build the fortress.
Create the file yourself and set \`prepared: true\`.
The code in the file should look like this
// pages/_fortress/[__key].js
${scriptText(modules)}`

export const prepareFortressInspect = (
  modules: string[],
  prepared?: boolean
): void => {
  if (prepared) return
  let dir = ''
  try {
    dir = `${findPagesDir('')}/_fortress`
  } catch (e) {
    if (e instanceof Error) console.error(e.message)
    console.log(suggestMessage(modules))
    process.exit(1)
    return
  }
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

  if (existsSync(`${dir}/[__key].ts`))
    writeFileSync(`${dir}/[__key].ts`, typeScriptText(modules))
  else if (existsSync(`${dir}/[__key].tsx`))
    writeFileSync(`${dir}/[__key].tsx`, typeScriptText(modules))
  else if (existsSync(`${dir}/[__key].js`))
    writeFileSync(`${dir}/[__key].js`, scriptText(modules))
  else if (existsSync(`${dir}/[__key].jsx`))
    writeFileSync(`${dir}/[__key].jsx`, scriptText(modules))
  else writeFileSync(`${dir}/[__key].js`, scriptText(modules))
}
