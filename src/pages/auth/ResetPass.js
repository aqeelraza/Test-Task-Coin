import React, { Component } from 'react'
import connect from 'react-redux/es/connect/connect'
import { withRouter, Redirect } from 'react-router-dom'
import queryString from 'query-string'
import { notifyError, notifyInfo } from '../../redux/reducers/notifier'
import { EmailInput, HiddenInput } from '../../controls'
import Form from '../../components/Form'
import LoginLayout from '../../layouts/LoginLayout'

class ResetPasswordForm extends Component {
  onSuccess = () => {
    this.props.history.push('/')
    this.props.notifyInfo(`Your password has been changed!`)
  }

  handleError = errors => {
    if (errors.length > 0 && errors[0] === 'NOT FOUND') {
      errors.splice(0)
      this.props.notifyError('Password reset link is invalid or expired!')
      this.props.history.push('/')
    }
  }

  render() {
    const params = queryString.parse(this.props.location.search)
    if (!params.token) {
      this.props.notifyError(`Invalid password reset token`)
      return <Redirect to="/" />
    }

    return (
      <LoginLayout>
        <div className="card">
          <div className="card-body">
            <div className="login-card-header">
              <h2>Reset password</h2>
            </div>
            <Form
              update={{ url: '/api/password_resets', root: 'user' }}
              onSuccess={this.onSuccess}
              onError={this.handleError}
              showCancel
              submitText="Reset"
              cancelText="Back"
              onCancel={() => this.props.history.goBack()}
            >
              <HiddenInput name="token" value={params.token} />
              <EmailInput title="New Password" name="password" minLength={5} />
            </Form>
          </div>
        </div>
      </LoginLayout>
    )
  }
}

export default connect(null, { notifyError, notifyInfo })(withRouter(ResetPasswordForm))
