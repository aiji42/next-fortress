import { findPagesDir } from 'next/dist/lib/find-pages-dir'
import { writeFileSync, existsSync, mkdirSync } from 'fs'

const scriptText = `export { getServerSideProps } from 'next-fortress/build/inspect'
const Inspect = () => null
export default Inspect
`

export const prepareFortressInspect = (
  prepared?: boolean
): void => {
  if (prepared) return
  let dir = ''
  try {
    dir = `${findPagesDir('')}/_fortress`
  } catch (e) {
    console.error(e.message)
    console.log(`> Could not create the necessary file to build the fortress.
Create the file yourself and set \`prepared: true\`.
The code in the file should look like this
// pages/_fortress/[__key].js
${scriptText}`)
    process.exit(1)
    return
  }
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  if (
    existsSync(`${dir}/[__key].ts`) ||
    existsSync(`${dir}/[__key].tsx`) ||
    existsSync(`${dir}/[__key].js`) ||
    existsSync(`${dir}/[__key].jsx`)
  )
    return
  writeFileSync(`${dir}/[__key].js`, scriptText)
}
