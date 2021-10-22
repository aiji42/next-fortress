import { NextApiHandler } from 'next'
import { setCookie } from 'nookies'
import { firebaseAdmin } from '../../../lib/admin'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') return res.status(404).send('Not Found')

  const auth = firebaseAdmin.auth()

  const expiresIn = 60 * 60 * 24 * 1000

  const id = (JSON.parse(req.body).id || '').toString()

  const sessionCookie = await auth.createSessionCookie(id, { expiresIn })

  const options = {
    maxAge: expiresIn,
    httpOnly: true,
    secure: true,
    path: '/'
  }

  setCookie({ res }, 'session', sessionCookie, options)

  res.send(JSON.stringify({ status: 'success' }))
}

export default handler
