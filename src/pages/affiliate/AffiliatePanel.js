import { Component } from 'react'
import PageHeader from '../../components/PageHeader'
import AppLayout from '../../layouts/AppLayout'
import { withRouter } from 'react-router-dom'
import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import PageLoader from '../../components/PageLoader'
import ShareAffiliateLink from './_helpers/ShareAffiliateLink'
import { LINKS } from '../../Constants'
import AffiliateSignup from './AffiliateSignup'
import Payouts from './_helpers/Payouts'
import RequestPayoutBtn from './_helpers/RequestPayoutBtn'

class AffiliatePanel extends Component {
  state = {
    summary: null,
  }

  renderContent() {
    if (!this.state.summary) {
      return <PageLoader url={`/api/commissions/`} onLoad={summary => this.setState({ summary })} />
    }

    let summary = this.state.summary
    let coupon = this.props.session.my_coupon
    let hasRecurring = parseInt(coupon.recurring_commission) > 0
    return (
      <Fragment>
        <PageHeader title={'Affiliate Panel'} subtitle={'Promote and receive commission on every successful conversion.'} />
        <div className="row">
          <div className="col">
            <div className="mt-4 p-3 mb-2 border bg-white">
              <div className="d-inline-block">
                <h4>${summary.credits.total}</h4>
                <div className="small text-muted text-uppercase">your commission</div>
              </div>
              <div className="small float-right">
                <RequestPayoutBtn session={this.props.session} credits={summary.credits} />
              </div>
            </div>

            <h4 className="mt-4 pt-4">Your stats</h4>
            <table className="table border bg-white">
              <thead>
                <th scope="col">Period</th>
                <th scope="col" style={{ textAlign: 'center' }}>
                  Signups
                </th>
                <th scope="col" style={{ textAlign: 'center' }}>
                  Conversions
                </th>
                <th scope="col" style={{ textAlign: 'center' }}>
                  Commission
                </th>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Last 7 days</th>
                  <td align="center">{summary.last_7_days.signups}</td>
                  <td align="center">{summary.last_7_days.conversions}</td>
                  <td align="center">${summary.last_7_days.commission}</td>
                </tr>
                <tr>
                  <th scope="row">Last 30 days</th>
                  <td align="center">{summary.last_30_days.signups}</td>
                  <td align="center">{summary.last_30_days.conversions}</td>
                  <td align="center">${summary.last_30_days.commission}</td>
                </tr>
                <tr>
                  <th scope="row">Lifetime</th>
                  <td align="center">{summary.lifetime.signups}</td>
                  <td align="center">{summary.lifetime.conversions}</td>
                  <td align="center">${summary.lifetime.commission}</td>
                </tr>
              </tbody>
            </table>

            <h4 className="mt-4 pt-4">Payout requests</h4>
            <Payouts />
          </div>

          <div className="col col-md-4">
            <div className="text-center">
              Share your affiliate link:
              <ShareAffiliateLink code={coupon.code} />
            </div>

            <h5 className="mt-5">Affiliate terms</h5>
            <table className="table table-striped">
              <tbody>
                <tr>
                  <td>Commission</td>
                  <td align="right">{coupon.commission}</td>
                </tr>
                {hasRecurring && (
                  <tr>
                    <td>Recurring commission</td>
                    <td align="right">{coupon.recurring_commission}</td>
                  </tr>
                )}
                <tr>
                  <td>Discount</td>
                  <td align="right">{coupon.discount}</td>
                </tr>
              </tbody>
            </table>

            <div className="small text-muted mt-5 pb-3">
              <b>How does this work?</b>
              <p>
                When someone signs up through your affiliate link they will receive a discount of {coupon.discount} on all plans. Once they
                make a payment you will receive {coupon.commission} commission on the price that was paid.{' '}
                {hasRecurring && (
                  <span>You will also receive a {coupon.recurring_commission} recurring commission on all future payments.</span>
                )}
              </p>
              <p className="pt-1">
                You can read our full terms{' '}
                <a href={LINKS.affiliate_terms} target="_BLANK">
                  here
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </Fragment>
    )
  }

  render() {
    if (!this.props.session.my_coupon.affiliate) {
      return <AffiliateSignup />
    }

    return (
      <AppLayout>
        <div className="page-body container">{this.renderContent()}</div>
      </AppLayout>
    )
  }
}

const mapStateToProps = ({ session }) => ({ session })
export default connect(mapStateToProps)(withRouter(AffiliatePanel))
