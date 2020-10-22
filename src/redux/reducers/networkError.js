export const showNetworkError = () => async dispatch => {
  dispatch({ type: 'SHOW_NETWORK_ERROR' })
}

export const hideNetworkError = () => async dispatch => {
  dispatch({ type: 'HIDE_NETWORK_ERROR' })
}

export const networkError = (state = false, action) => {
  switch (action.type) {
    case 'SHOW_NETWORK_ERROR':
      return true
    case 'HIDE_NETWORK_ERROR':
      return false
    default:
      return state
  }
}
