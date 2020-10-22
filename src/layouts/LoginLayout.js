import React from 'react'
import NotifierBanner from './_helpers/NotifierBanner'
import ErrorBoundary from '../components/ErrorBoundary'

const LoginLayout = ({ children }) => (
  <div className="login-page">
    <div className="container">
      <div className="row">
        <div className="col-xl-5 col-lg-6 col-md-10 col mx-auto">
          <ErrorBoundary>
            <NotifierBanner />
            {children}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  </div>
)

export default LoginLayout
