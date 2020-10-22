import React from 'react'
import AppLayout from '../../layouts/AppLayout'
import PageHeader from '../../components/PageHeader'
import { Button } from '../../controls'
import { LINKS } from '../../Constants'
import axios from 'axios'
import _ from 'lodash'
import connect from 'react-redux/es/connect/connect'
import { setSession } from '../../redux/reducers/session'
import { notifyError, notifyInfo } from '../../redux/reducers/notifier'
import { withRouter } from 'react-router-dom'

class AffiliateSignup extends React.Component {
  state = {
    loading: false,
  }

  handleClick = () => {
    if (this.state.loading) return
    this.setState({ loading: true })
    axios
      .post('/api/users/activate_affiliate')
      .then(response => {
        this.props.notifyInfo('Congrats, you are now an affiliate!')
        window.Intercom('trackEvent', 'affiliate-activated')
        this.props.setSession(response.data)
        this.setState({ loading: false })
      })
      .catch(res => {
        this.props.notifyError(_.get(res, 'response.data.errors[0].detail') || res.message)
        this.setState({ loading: false })
      })
  }

  render() {
    return (
      <AppLayout>
        <div className="page-body container">
          <PageHeader
            title={`Affiliate Program`}
            subtitle={`Promote us and receive commission on every successful conversion.`}
          />
          <div className="row">
            <div className="col" />
            <div className="col col-md-6">
              You should carefully read the{' '}
              <a href={LINKS.affiliate_terms} target="_BLANK">
                Affiliate Terms
              </a>{' '}
              before continuing. A brief summary of the main points is provided below:
              <ol className="pt-3">
                <li>Base referral commission is 20% unless something else has been agreed with us.</li>
                <li>
                  Payouts can be requested through the Affiliate panel - there is a limit of 1 payout every 30 days and minimum payout
                  amount is $100.
                </li>
                <li>
                  Any commission earned is locked for a period of 30 days from the date you received it. This limit is in place to guard
                  against refunds/chargebacks.
                </li>
                <li>Spamming websites with your affiliate link is not allowed and may result in account suspension.</li>
              </ol>
              Note: Any credits you have accrued as part of the refer-a-friend program will be lost once you make the switch!
              <div className="text-center mt-4">
                <Button color="secondary" onClick={() => this.props.history.goBack()} className="mr-2">
                  Back
                </Button>
                <Button color="primary" size={'sm'} loading={this.state.loading} onClick={this.handleClick}>
                  Join Program
                </Button>
              </div>
            </div>
            <div className="col" />
          </div>
        </div>
      </AppLayout>
    )
  }
}

function mapStateToProps({ session }) {
  return {
    session,
  }
}

export default connect(mapStateToProps, { setSession, notifyError, notifyInfo })(withRouter(AffiliateSignup))
