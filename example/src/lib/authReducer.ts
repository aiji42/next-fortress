const initialState = {}

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'login':
      return action.payload.user
    case 'logout':
      document.location.replace('/firebase')
      return initialState
    default:
      return state
  }
}

export default {
  initialState,
  reducer
}
