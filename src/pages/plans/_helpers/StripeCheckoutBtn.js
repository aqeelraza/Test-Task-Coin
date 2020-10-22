import React from 'react'
import StripeCheckout from 'react-stripe-checkout'
import axios from 'axios'
import ReactGA from 'react-ga'
import _ from 'lodash'
import { Button } from '../../../controls'
import connect from 'react-redux/es/connect/connect'
import { notifyError, notifyInfo } from '../../../redux/reducers/notifier'
import { setSession } from '../../../redux/reducers/session'
import Cookies from 'universal-cookie'
import loadScript from '../../../common/loadScript'

class StripeCheckoutBtn extends React.Component {
  state = {
    loading: false,
  }

  onToken = token => {
    let plan = this.props.plan
    this.setState({ loading: true })
    axios
      .post(`/api/subscriptions/`, { plan_id: plan.id, token: token })
      .then(res => {
        if (res.data.requires_action) {
          this.handleAction(res.data)
        } else {
          this.success(plan, res.data)
        }
      })
      .catch(res => {
        // this happens when card is declined due to high risk
        let message =
          (_.get(res, 'response.data.errors') && res.response.data.errors.length > 0 && res.response.data.errors[0].detail) || res.message
        this.props.notifyError(message)
        window.Intercom('trackEvent', 'payment-failed', { plan: plan.name, error: message })
        this.setState({ loading: false })
      })
  }

  onAction = result => {
    let plan = this.props.plan
    if (result.error) {
      this.props.notifyError(result.error.message)
      this.setState({ loading: false })
      window.Intercom('trackEvent', 'payment-failed', { plan: plan.name, error: result.error.message })
    } else {
      // The card action has been handled
      // The PaymentIntent can be confirmed again on the server
      axios
        .patch(`/api/subscriptions/`, { plan_id: plan.id, payment_intent_id: result.paymentIntent.id })
        .then(res => {
          if (res.data.requires_action) {
            alert('Unable to confirm payment')
            window.Intercom('trackEvent', 'payment-failed', { plan: plan.name, error: 'unable to confirm payment' })
          } else {
            this.success(plan, res.data)
          }
        })
        .catch(res => {
          if (_.get(res, 'response.data.errors') && res.response.data.errors.length > 0) {
            this.props.notifyError(res.response.data.errors[0].detail)
            window.Intercom('trackEvent', 'payment-failed', { plan: plan.name, error: res.response.data.errors[0].detail })
          } else {
            this.props.notifyError(res.message)
            window.Intercom('trackEvent', 'payment-failed', { plan: plan.name, error: res.message })
          }
          this.setState({ loading: false })
        })
    }
  }

  handleAction(response) {
    loadScript('https://js.stripe.com/v3/', () => {
      window
        .Stripe(window.stripeKey)
        .handleCardAction(response.payment_intent_client_secret)
        .then(this.onAction)
    })
  }

  success = (plan, sub) => {
    this.props.notifyInfo('Your purchase was successful!')
    this.props.setSession({ ...this.props.session, active_subscription: sub })
    this.setState({ loading: false })
    ReactGA.event({ category: 'user', action: 'subscribed', label: plan.name, value: parseInt(sub.amount_paid) })
    window.Intercom('trackEvent', 'payment-success', { plan: plan.name, amount_paid: parseInt(sub.amount_paid) })

    if (sub.commission_coupon === 'ADRECSE') {
      let refid = new Cookies().get('extrefid')
      if (refid) {
        window.adrecord = {
          programID: 1006,
          orderID: sub.id,
          orderValue: sub.amount_paid_in_cents,
          currency: 'USD',
          trackID: refid,
        }
        loadScript('https://track.adrecord.com/track.js')
      }
    }
  }

  render() {
    return (
      <StripeCheckout {...this.props} token={this.onToken}>
        <Button color="primary" isLoading={this.state.loading} isDisabled={this.state.loading}>
          {this.props.btnText}
        </Button>
      </StripeCheckout>
    )
  }
}

function mapStateToProps({ session }) {
  return { session }
}

export default connect(mapStateToProps, { notifyError, notifyInfo, setSession })(StripeCheckoutBtn)
