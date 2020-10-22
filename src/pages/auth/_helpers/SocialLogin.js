import React, { Fragment } from 'react'
import axios from 'axios'
import GoogleLogin from 'react-google-login'
import { toastr } from 'react-redux-toastr'
import { Button } from 'reactstrap'
import { COINBASE_LOGIN_REDIRECT_URL } from '../../../Constants'
import queryString from 'query-string'
import { trackingParams } from '../../../common'

class SocialLogin extends React.Component {
  state = {
    googleError: null,
    loadingGoogle: false,
  }

  onGoogleSuccess = response => {
    this.setState({ loadingGoogle: true })
    axios
      .post('/api/oauth2/google', { token: response.tokenId, ...trackingParams() })
      .then(res => this.props.onSuccess(res.data))
      .catch(error => toastr.error(error.message))
      .then(() => this.setState({ loadingGoogle: false }))
  }

  onGoogleError = response => {
    this.setState({ googleError: response.message })
  }

  coinbaseAuthUrl() {
    return (
      'https://www.coinbase.com/oauth/authorize?' +
      queryString.stringify({
        response_type: 'code',
        client_id: process.env.REACT_APP_COINBASE_CLIENT_ID,
        redirect_uri: COINBASE_LOGIN_REDIRECT_URL,
        state: Math.random()
          .toString(36)
          .substring(2, 15),
        scope: [
          'wallet:user:email',
          'wallet:accounts:read',
          'wallet:buys:read',
          'wallet:deposits:read',
          'wallet:sells:read',
          'wallet:transactions:read',
          'wallet:withdrawals:read',
        ].join(','),
        account: 'all',
      })
    )
  }

  render() {
    return (
      <Fragment>
        {this.state.googleError}
        <Button
          onClick={() => (window.location = this.coinbaseAuthUrl())}
          className="btn-block btn-social btn-coinbase mb-2"
          color={'primary'}
        >
          <i className="fa fa-copyright" />
          Continue with <b>Coinbase</b>
        </Button>
        <GoogleLogin
          clientId="976614195048-reu2ps134tnsb5vskn4ptctjn25bfnc8.apps.googleusercontent.com"
          buttonText="Continue with Google"
          onSuccess={this.onGoogleSuccess}
          onFailure={this.onGoogleError}
          cookiePolicy={'single_host_origin'}
          disabled={this.state.loadingGoogle}
          render={props => (
            <Button onClick={props.onClick} disabled={props.disabled} className="btn-block btn-social mb-4">
              <i className="fab fa-google" />
              Continue with <b>Google</b>
            </Button>
          )}
        />
        <div className="hr-label mb-4">
          <span className="text-muted small">or</span>
        </div>
      </Fragment>
    )
  }
}

export default SocialLogin
