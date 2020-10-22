import React from 'react'
import connect from 'react-redux/es/connect/connect'
import { Link } from 'react-router-dom'

const GainsBlockedNotice = ({ session, forceShow }) =>
  session.gains_blocked || forceShow ? (
    <div className={'alert alert-danger'}>
      You have exceeded the total number of transactions allowed on the free plan. Please reduce your transaction count to below 10k or
      purchase a tax plan to continue using this app. <b>Your capital gains and dashboard are not being updated.</b>{' '}
      <Link to={'/plans'}>Upgrade now</Link>
    </div>
  ) : null

const mapStateToProps = ({ session }) => ({ session })

export default connect(mapStateToProps)(GainsBlockedNotice)
