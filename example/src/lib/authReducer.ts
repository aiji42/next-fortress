const initialState = {}

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'login':
      action.payload.user.getIdToken().then((id: string) => {
        return fetch('/api/firebase/create-token', {
          method: 'POST',
          body: JSON.stringify({ id })
        })
      })
      return action.payload.user
    case 'logout':
      fetch('/api/firebase/destroy-token', {
        method: 'POST'
      }).then(() => {
        document.location.reload()
      })

      return initialState
    default:
      return state
  }
}

export default {
  initialState,
  reducer
}
