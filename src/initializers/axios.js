import axios from 'axios'
import { bindActionCreators } from 'redux'
import { clearApiKey } from '../redux/reducers/apiKey'
import { clearSession } from '../redux/reducers/session'
import { notifyError } from '../redux/reducers/notifier'
import { showNetworkError } from '../redux/reducers/networkError'
import store from './store'
import { loadCsrfToken, setServerToken } from '../common/csrf-token'

loadCsrfToken()

// setting up Axios
axios.defaults.baseURL =
  process.env.REACT_APP_API_URL || 'https://koinly-staging.herokuapp.com'
axios.defaults.timeout = 30000
axios.defaults.withCredentials = true
axios.interceptors.request.use(
  request => {
    const state = store.getState()
    request.headers['Caches-Requests'] = 1
    if (state.apiKey) {
      request.headers['X-Auth-Token'] = state.apiKey
      request.headers['Access-Control-Allow-Credentials'] = 'true'
    }
    if (window.csrfToken) {
      request.headers['X-Csrf-Token'] = window.csrfToken
    }
    return request
  },
  error => {
    // intercept and handle general errors here
    console.log('Error in request', error.response)
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  response => {
    setServerToken(response.headers['x-csrf-token']) // lowercase
    return response
  },
  error => {
    // intercept and handle general errors here
    if (error.response && error.response.status === 401) {
      // logout
      if (store.getState().apiKey) {
        const actions = bindActionCreators({ clearApiKey, clearSession, notifyError }, store.dispatch)
        actions.clearApiKey()
        actions.clearSession()
        actions.notifyError('You were logged out. Please login again...')
      }
    } else if (error && !error.response && !axios.isCancel(error) && error.message && error.message.toLowerCase() === 'network error') {
      const actions = bindActionCreators({ showNetworkError }, store.dispatch)
      actions.showNetworkError()
    }
    return Promise.reject(error)
  }
)
