import React, { Component } from 'react'
import axios from 'axios'
import connect from 'react-redux/es/connect/connect'
import { Router, Switch } from 'react-router-dom'
import Loader from './components/Loader'
import { clearApiKey, setApiKey } from './redux/reducers/apiKey'
import { clearSession, setSession } from './redux/reducers/session'
import { notifyError, notifyInfo } from './redux/reducers/notifier'
import ReduxToastr from 'react-redux-toastr'
import SyncStatusPoller from './pages/_helpers/SyncStatusPoller'
import CloudflareErrorBox from './pages/_helpers/CloudflareErrorBox'
import PrivateRoute, { MyRoute } from './components/PrivateRoute'
import history from './initializers/history'
import ResetPass from './pages/auth/ResetPass'
import ForgotPass from './pages/auth/ForgotPass'
import Signup from './pages/auth/Signup'
import Login from './pages/auth/Login'
import EdgeSignup from './pages/auth/EdgeSignup'
import CoinbaseLoginCb from './pages/callbacks/CoinbaseLoginCb'

import './styles/rsuite-styles.css' // package style messes up our website so had to copy them here
import './styles/rsuite-icon-font.css'
import 'react-redux-toastr/lib/css/react-redux-toastr.min.css'
import './styles/App.css'

const PrivateApp = React.lazy(() => import('./PrivateApp'))

class App extends Component {
  state = {}

  componentDidMount() {
    if (this.props.apiKey && !this.props.session) {
      this.restoreSession()
    }
  }

  restoreSession = () => {
    this.setState({ restoringSession: true })
    axios
      .get('/api/sessions')
      .then(res => {
        this.props.setSession(res.data)
      })
      .catch(() => {
        this.props.notifyError('Session could not be restored. Please log-in')
        this.props.clearApiKey()
      })
      .then(() => this.setState({ restoringSession: false }))
  }

  render() {
    if (this.state.restoringSession) {
      return <Loader />
    }

    return (
      <Router history={history}>
        <React.Suspense fallback={<Loader />}>
          <Switch>
            <MyRoute path="/reset" component={ResetPass} title="Password reset" />
            <MyRoute path="/forgot" component={ForgotPass} title="Forgot password" />
            <MyRoute path="/signup" component={Signup} title="Signup" />
            <MyRoute path="/login" component={Login} title="Login" />
            <MyRoute path="/edge-signup" component={EdgeSignup} title="Signup from Edge" />
            <MyRoute path="/callbacks/coinbase" component={CoinbaseLoginCb} title="Coinbase Login" />
            <PrivateRoute component={PrivateApp} />
          </Switch>

          <ReduxToastr
            timeOut={4000}
            newestOnTop={false}
            preventDuplicates
            position="bottom-center"
            transitionIn="fadeIn"
            transitionOut="fadeOut"
            progressBar
            closeOnToastrClick
          />
          {this.props.session && !this.props.networkError && <SyncStatusPoller />}
          {this.props.networkError && <CloudflareErrorBox />}
        </React.Suspense>
      </Router>
    )
  }
}

const mapStateToProps = ({ apiKey, session, networkError }) => ({ apiKey, session, networkError })

const mapDispatchToProps = {
  setApiKey,
  setSession,
  clearApiKey,
  clearSession,
  notifyError,
  notifyInfo,
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
