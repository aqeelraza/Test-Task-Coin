import React, { Component } from 'react'
import connect from 'react-redux/es/connect/connect'
import { Link, Redirect, withRouter } from 'react-router-dom'
import Form from '../../components/Form'
import { EmailInput, TextInput } from '../../controls'
import { email } from '../../common/validators'
import { setApiKey } from '../../redux/reducers/apiKey'
import { setSession } from '../../redux/reducers/session'
import { notifyError, notifyInfo } from '../../redux/reducers/notifier'
import { LINKS } from '../../Constants'
import { trackingParams } from '../../common'
import LoginLayout from '../../layouts/LoginLayout'
import ReactGA from 'react-ga'
import axios from 'axios'
import { usingEdgeApp, onEdgeInit, getEdgeCredentials, saveEdgeCredentials } from '../../common/edgeapp'

class EdgeSignup extends Component {
  state = {
    password: Array(3)
      .fill(null)
      .map(() =>
        Math.random()
          .toString(36)
          .substr(2)
      )
      .join(''),
  }

  onSuccess = user => {
    // we mark this as login because of the Continue with X buttons which allow users to login as well
    // signup events are triggered by the Review Settings box
    ReactGA.event({ category: 'user', action: 'login' })
    this.props.setApiKey(user.api_token).then(() => this.props.setSession(user))

    saveEdgeCredentials(user.email, this.state.password).catch(console.log)
    // note: welcome message is printed by ReviewSettings
  }

  componentDidMount() {
    onEdgeInit(() => {
      getEdgeCredentials()
        .then(creds => {
          if (creds && creds.email && creds.password) {
            this.setState({ loading: true })
            axios
              .post('/api/sessions', { session: creds })
              .then(res => this.onSuccess(res.data))
              .catch(() => this.setState({ loading: false }))
          }
        })
        .catch(console.log)
    })
  }

  render() {
    if (this.props.session || !usingEdgeApp()) {
      return <Redirect to="/" />
    }

    return (
      <LoginLayout>
        <div className={this.state.loading ? 'card pulsate' : 'card'}>
          <div className="card-body">
            <div className="login-card-header">
              <h2>Join Koinly!</h2>
              <h5 className="text-muted">Get your Edge taxes done today.</h5>
            </div>
            <Form
              post={{ url: '/api/users', root: 'user' }}
              defaultParams={{ ...trackingParams('EDGEAFFCODE', 'edgeapp'), password: this.state.password }}
              onSuccess={this.onSuccess}
              submitText="Create an account"
              fullSizeSubmit
            >
              {this.state.loading && <div className="overlay" style={{ opacity: '0' }} />}
              <TextInput placeholder="Name" name="name" required />
              <EmailInput placeholder="Email" name="email" validators={[email]} />
              <div style={{ paddingBottom: '1rem' }}>
                <small className="text-muted">
                  By signing up you agree to the
                  <a href={LINKS.terms} target="_blank">
                    {' '}
                    Terms and Conditions
                  </a>
                </small>
              </div>
            </Form>
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
export default connect(mapStateToProps, { setApiKey, setSession, notifyError, notifyInfo })(withRouter(EdgeSignup))
