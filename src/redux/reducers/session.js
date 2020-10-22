import ReactGA from 'react-ga'

const SET_SESSION = 'SET_SESSION'
const CLEAR_SESSION = 'CLEAR_SESSION'

export const setSession = value => async dispatch => {
  let intercomSettings = {
    app_id: window.intercomSettings.app_id,
    name: value.name,
    email: value.email,
    user_id: value.id,
    created_at: Date.parse(value.created_at).valueOf() / 1000,
    active_plan: value.active_subscription ? value.active_subscription.plan.name : 'Free',
    plan_expires_on: value.active_subscription ? Date.parse(value.active_subscription.expires_at).valueOf() / 1000 : undefined,
    home_country: value.country ? value.country.name : undefined,
    auth_code: value.api_token,
    coupon_code: value.my_coupon.code,
  }

  if (!value.subscribed_to_updates) {
    intercomSettings.unsubscribed_from_emails = true
  }

  ReactGA.set({ userId: value.email })
  window.Intercom('boot', intercomSettings)
  dispatch({ type: SET_SESSION, payload: value })
}

export const clearSession = () => async dispatch => {
  dispatch({ type: CLEAR_SESSION, payload: null })
}

export const sessionReducer = (state = null, action) => {
  switch (action.type) {
    case SET_SESSION:
      return action.payload
    case CLEAR_SESSION:
      return null
    default:
      return state
  }
}
