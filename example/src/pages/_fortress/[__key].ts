import { getServerSideProps as _getServerSideProps } from 'next-fortress/build/inspect'
import { GetServerSideProps } from 'next'
import { FC } from 'react'
import nookies from 'nookies'
import { verifyIdToken } from '../../lib/firebaseAdmin'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookies = nookies.get(ctx)
  const isValid = await verifyIdToken(cookies['__fortressFirebase'])
  console.log(cookies)
  console.log(isValid)
  return _getServerSideProps(ctx)
}

const Inspect: FC = () => null

export default Inspect
