import { makeFirebaseInspector } from 'next-fortress'

export const middleware = makeFirebaseInspector(
  {
    type: 'redirect',
    destination: '/firebase'
  },
  (res) => res.firebase.sign_in_provider !== 'anonymous'
)
