let MESSAGE_ID = 1

export const notifyError = message => async dispatch => {
  MESSAGE_ID += 1
  dispatch({
    type: 'NOTIFIER_MSG',
    payload: { type: 'error', message, id: MESSAGE_ID, time: new Date().getTime() },
  })
}

export const notifyInfo = message => async dispatch => {
  MESSAGE_ID += 1
  dispatch({
    type: 'NOTIFIER_MSG',
    payload: { type: 'info', message, id: MESSAGE_ID, time: new Date().getTime() },
  })
}

export const clearNotification = id => async dispatch => {
  dispatch({ type: 'NOTIFIER_CLEAR', payload: { id } })
}

export const notifierReducer = (state = null, action) => {
  switch (action.type) {
    case 'NOTIFIER_MSG':
      return action.payload
    case 'NOTIFIER_CLEAR':
      if (state && action.payload.id === state.id) {
        return null
      }
      return state

    default:
      return state
  }
}
