import React, { Component } from 'react'
import { Link, Redirect, withRouter } from 'react-router-dom'
import connect from 'react-redux/es/connect/connect'
import { EmailInput, PasswordInput } from '../../controls'
import Form from '../../components/Form'
import { setApiKey } from '../../redux/reducers/apiKey'
import { setSession } from '../../redux/reducers/session'
import { notifyError, notifyInfo } from '../../redux/reducers/notifier'
import { email } from '../../common/validators'
import LoginLayout from '../../layouts/LoginLayout'
import SocialLogin from './_helpers/SocialLogin'
import ReactGA from 'react-ga'

class Login extends Component {
  onSignIn = user => {
    ReactGA.event({ category: 'user', action: 'login' })
    this.props.setApiKey(user.api_token).then(() => this.props.setSession(user))
  }

  handleError = errors => {
    if (errors.length > 0 && errors[0] === 'NOT FOUND') {
      errors.splice(0)
      this.props.notifyError('User with this email/password was not found!')
    }
  }

  render() {
    if (this.props.session) {
      const { from } = this.props.location.state || { from: { pathname: '/' } }
      if (!from.pathname || from.pathname.startsWith('/login') || from.pathname.startsWith('/logout')) from.pathname = '/'
      return <Redirect to={from} />
    }

    return (
      <LoginLayout>
        <div className="card">
          <div className="card-body">
            <div className="login-card-header">
              <h2>Hello!</h2>
              <h5 className="text-muted">Sign in to your account here.</h5>
            </div>
            <SocialLogin onSuccess={this.onSignIn} />
            <Form
              post={{ url: '/api/sessions', root: 'session' }}
              onSuccess={this.onSignIn}
              onError={this.handleError}
              submitText="Sign in"
              fullSizeSubmit
              protectedByCf
            >
              <EmailInput placeholder="Email" name="email" validators={[email]} />
              <PasswordInput placeholder="Password" name="password" minLength={5} formGroupStyle={{ marginBottom: 0 }} />
              <div style={{ textAlign: 'right', paddingBottom: '1rem' }}>
                <Link to="/forgot">
                  <small>Forgot password?</small>
                </Link>
              </div>
            </Form>
          </div>
        </div>
        <div style={{ textAlign: 'center', paddingTop: '10px' }}>
          <Link to="/signup">Don't have an account yet? Sign up!</Link>
        </div>
      </LoginLayout>
    )
  }
}

const mapStateToProps = ({ session }) => ({ session })
export default connect(mapStateToProps, { setApiKey, setSession, notifyError, notifyInfo })(withRouter(Login))
