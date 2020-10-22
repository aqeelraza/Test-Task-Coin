import React, { Component } from 'react'
import connect from 'react-redux/es/connect/connect'
import { Link, Redirect, withRouter } from 'react-router-dom'
import Form from '../../components/Form'
import { EmailInput, PasswordInput, TextInput, ToggleInput } from '../../controls'
import { email } from '../../common/validators'
import { setApiKey } from '../../redux/reducers/apiKey'
import { setSession } from '../../redux/reducers/session'
import { notifyError, notifyInfo } from '../../redux/reducers/notifier'
import { LINKS } from '../../Constants'
import { trackingParams } from '../../common'
import LoginLayout from '../../layouts/LoginLayout'
import SocialLogin from './_helpers/SocialLogin'
import ReactGA from 'react-ga'

class Signup extends Component {
  onSignUp = user => {
    // we mark this as login because of the Continue with X buttons which allow users to login as well
    // signup events are triggered by the Review Settings box
    ReactGA.event({ category: 'user', action: 'login' })
    this.props.setApiKey(user.api_token).then(() => this.props.setSession(user))
    // note: welcome message is printed by ReviewSettings
  }

  render() {
    if (this.props.session) {
      return <Redirect to="/" />
    }

    return (
      <LoginLayout>
        <div className="card">
          <div className="card-body">
            <div className="login-card-header">
              <h2>Join Koinly!</h2>
              <h5 className="text-muted">Create your free account now.</h5>
            </div>
            <SocialLogin onSuccess={this.onSignUp} />
            <Form
              post={{ url: '/api/users', root: 'user' }}
              defaultParams={trackingParams()}
              onSuccess={this.onSignUp}
              submitText="Create an account"
              fullSizeSubmit
              protectedByCf
            >
              <TextInput placeholder="Name" name="name" required />
              <EmailInput placeholder="Email" name="email" validators={[email]} />
              <PasswordInput placeholder="Password" name="password" minLength={5} />
              <ToggleInput title="Send me news related to crypto taxes" name={'subscribed_to_news'} value={true} />
              <ToggleInput title="Send me product updates & discounts" name={'subscribed_to_updates'} value={true} />
            </Form>
            <div style={{ paddingBottom: '1rem' }} className={'text-center'}>
              <small className="text-muted">
                By signing up you agree to our
                <a href={LINKS.terms} target="_blank">
                  {' '}
                  Terms and Conditions
                </a>
              </small>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', paddingTop: '10px' }}>
          <Link to="/">Already have an account? Sign in!</Link>
        </div>
      </LoginLayout>
    )
  }
}

const mapStateToProps = ({ session }) => ({ session })
export default connect(mapStateToProps, { setApiKey, setSession, notifyError, notifyInfo })(withRouter(Signup))
