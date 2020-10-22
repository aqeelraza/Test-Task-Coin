import { Component } from 'react'
import PageHeader from '../../components/PageHeader'
import AppLayout from '../../layouts/AppLayout'
import { withRouter, Link } from 'react-router-dom'
import React from 'react'
import { connect } from 'react-redux'
import ShareAffiliateLink from './_helpers/ShareAffiliateLink'

class ReferFriends extends Component {
  render() {
    let coupon = this.props.session.my_coupon
    return (
      <AppLayout>
        <div className="page-body container">
          <PageHeader
            title={`Give ${coupon.discount}, Get ${coupon.commission}`}
            subtitle={`Give friends ${coupon.discount} off on their first order and get ${coupon.commission} in return. Win win!`}
          />
          <div className="row">
            <div className="col" />
            <div className="col col-md-6 text-center">
              Share your personal referral link:
              <ShareAffiliateLink code={coupon.code} />
              <div className="small text-muted mt-5 pb-3">
                When a friend purchases a subscription for the first time, you will receive a credit of {coupon.commission} and they
                will get {coupon.discount} off on their subscription. You can redeem credits on future purchases. To qualify, your friend
                must sign up using your personal referral link.
              </div>
              <Link className="small" to="/affiliate">
                Want to become an affiliate?
              </Link>
            </div>
            <div className="col" />
          </div>
        </div>
      </AppLayout>
    )
  }
}

const mapStateToProps = ({ session }) => ({ session })
export default connect(mapStateToProps)(withRouter(ReferFriends))
