import React, { Component } from 'react'
import connect from 'react-redux/es/connect/connect'
import { withRouter } from 'react-router-dom'
import Form from '../../components/Form'
import { EmailInput } from '../../controls'
import { setApiKey } from '../../redux/reducers/apiKey'
import { setSession } from '../../redux/reducers/session'
import { notifyError, notifyInfo } from '../../redux/reducers/notifier'
import { email } from '../../common/validators'
import LoginLayout from '../../layouts/LoginLayout'

class ForgotPasswordForm extends Component {
  onSuccess = () => {
    this.props.history.push('/')
    this.props.notifyInfo('An email with reset instructions has been sent to you!')
  }

  handleError = errors => {
    if (errors.length > 0 && errors[0] === 'NOT FOUND') {
      errors.splice(0)
      this.props.notifyError('User with this email was not found!')
    }
  }

  render() {
    return (
      <LoginLayout>
        <div className="card">
          <div className="card-body">
            <div className="login-card-header">
              <h2>Forgot your password?</h2>
            </div>
            <Form
              post={{ url: '/api/password_resets', root: 'user' }}
              onSuccess={this.onSuccess}
              onError={this.handleError}
              showCancel
              submitText="Reset"
              cancelText="Back"
              onCancel={() => this.props.history.goBack()}
              protectedByCf
            >
              <EmailInput title="Email" name="email" validators={[email]} />
            </Form>
          </div>
        </div>
      </LoginLayout>
    )
  }
}

export default connect(null, { setApiKey, setSession, notifyError, notifyInfo })(withRouter(ForgotPasswordForm))
