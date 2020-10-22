import React, { Component } from 'react'
import axios from 'axios'
import connect from 'react-redux/es/connect/connect'
import { withRouter } from 'react-router-dom'
import { clearApiKey } from '../../redux/reducers/apiKey'
import { clearSession } from '../../redux/reducers/session'
import { notifyInfo } from '../../redux/reducers/notifier'
import AppLayout from '../../layouts/AppLayout'

class Logout extends Component {
  componentDidMount() {
    axios.delete('/api/sessions').then(() => {
      this.props.clearApiKey()
      this.props.clearSession()
      this.props.notifyInfo('You have been logged out.')
    })
  }

  render() {
    return (
      <AppLayout>
        <div className="container-fluid h-100">
          <div className="row justify-content-center h-100">
            <div className="col-12 text-center">
              <div className="display-1 pulsate mt-auto">Logging out...</div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }
}

function mapStateToProps({ session, apiKey }) {
  return { session, apiKey }
}

export default connect(mapStateToProps, { clearApiKey, clearSession, notifyInfo })(withRouter(Logout))
