export const checkSyncStatus = () => async dispatch => {
  dispatch({ type: 'CHECK_SYNC_STATUS' })
}

export const syncFinished = () => async dispatch => {
  dispatch({ type: 'SYNC_FINISHED' })
}

// we want to load the jobs when user loads this page
export const syncStatusReducer = (state = true, action) => {
  switch (action.type) {
    case 'CHECK_SYNC_STATUS':
      return true
    case 'SYNC_FINISHED':
      return null
    default:
      return state
  }
}
