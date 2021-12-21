import { NextApiHandler } from 'next'
import { destroyCookie } from 'nookies'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') return res.status(404).send('Not Found')

  destroyCookie({ res }, 'session', {
    path: '/'
  })

  res.send(JSON.stringify({ status: 'success' }))
}

export default handler
