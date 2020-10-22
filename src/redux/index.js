import { combineReducers } from 'redux'
import { apiKeyReducer } from './reducers/apiKey'
import { sessionReducer } from './reducers/session'
import { notifierReducer } from './reducers/notifier'
import { syncStatusReducer } from './reducers/syncStatus'
import { networkError } from './reducers/networkError'
import { reducer as toastrReducer } from 'react-redux-toastr'

/**
 * This contains all GLOBAL client-side state in the application
 * All global state is handled by the Redux library and all reducers defined in the "reducers" package
 * To understand Redux see https://redux.js.org/
 * To understand Redux for React see https://github.com/reduxjs/react-redux
 * To see a tutorial see https://redux.js.org/basics/example-todo-list
 */
export default combineReducers({
  apiKey: apiKeyReducer,
  session: sessionReducer,
  notifier: notifierReducer,
  syncStatus: syncStatusReducer,
  networkError: networkError,
  toastr: toastrReducer,
})
