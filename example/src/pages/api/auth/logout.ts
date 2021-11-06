import { handleLogout } from '@auth0/nextjs-auth0'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = (req, res) => {
  return handleLogout(req, res, { returnTo: '/auth0' })
}

export default handler
