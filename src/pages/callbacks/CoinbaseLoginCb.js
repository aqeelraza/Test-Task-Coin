import React from 'react'
import { withRouter } from 'react-router-dom'
import Loader from '../../components/Loader'
import axios from 'axios'
import queryString from 'query-string'
import LoginLayout from '../../layouts/LoginLayout'
import { toastr } from 'react-redux-toastr'
import connect from 'react-redux/es/connect/connect'
import { setApiKey } from '../../redux/reducers/apiKey'
import { setSession } from '../../redux/reducers/session'
import _ from 'lodash'
import { COINBASE_LOGIN_REDIRECT_URL } from '../../Constants'
import { trackingParams } from '../../common'

class CoinbaseLoginCb extends React.Component {
  componentDidMount() {
    let params = queryString.parse(this.props.location.search)
    params.redirect_uri = COINBASE_LOGIN_REDIRECT_URL
    axios
      .post('/api/oauth2/coinbase', { ...trackingParams(), ...params })
      .then(res => this.onSuccess(res.data))
      .catch(error => this.onError(error))
  }

  onSuccess(user) {
    this.props
      .setApiKey(user.api_token)
      .then(() => this.props.setSession(user))
      .then(() => this.props.history.push('/'))
  }

  onError(res) {
    toastr.error(_.get(res, 'response.data.errors[0].detail') || res.message)
    this.props.history.push('/')
  }

  render() {
    return (
      <LoginLayout>
        <Loader />
      </LoginLayout>
    )
  }
}

export default connect(null, { setApiKey, setSession })(withRouter(CoinbaseLoginCb))
