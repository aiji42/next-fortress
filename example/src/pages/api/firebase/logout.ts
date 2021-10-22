import { NextApiHandler } from 'next'
import { parseCookies, destroyCookie } from 'nookies'
import { firebaseAdmin } from '../../../lib/admin'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') return res.status(404).send('Not Found')

  const auth = firebaseAdmin.auth()

  const sessionId = parseCookies({ req }).session || ''

  const decodedClaims = await auth
    .verifySessionCookie(sessionId)
    .catch(() => null)

  if (decodedClaims) {
    await auth.revokeRefreshTokens(decodedClaims.sub)
  }

  destroyCookie({ res }, 'session', {
    path: '/'
  })

  res.send(JSON.stringify({ status: 'success' }))
}

export default handler
