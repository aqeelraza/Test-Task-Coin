import Cookies from 'universal-cookie'

const API_KEY_COOKIE = 'API_KEY'
const SET_API_KEY = 'SET_API_KEY'
const CLEAR_API_KEY = 'CLEAR_API_KEY'

const cookies = new Cookies()
const initialState = cookies.get(API_KEY_COOKIE) || ''

export const setApiKey = value => async dispatch => {
  dispatch({ type: SET_API_KEY, payload: value })
}

export const clearApiKey = () => async dispatch => {
  dispatch({ type: CLEAR_API_KEY, payload: null })
}

export const apiKeyReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_API_KEY:
      cookies.set(API_KEY_COOKIE, action.payload, { path: '/' })
      return action.payload
    case CLEAR_API_KEY:
      cookies.remove(API_KEY_COOKIE, { path: '/' })
      return null
    default:
      return state
  }
}
