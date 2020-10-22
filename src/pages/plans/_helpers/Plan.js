import React from 'react'
import { Button } from '../../../controls'
import moment from 'moment'
import ErrorIcon from '../../../components/ErrorIcon'
import StripeCheckoutBtn from './StripeCheckoutBtn'
import logo from '../../../images/logo.jpg'
import { planColor } from '../../../common'
import Info from '../../../components/Info'

const ActionBtn = ({ plan, activeSub, loading, totalTxns, email }) => {
  if (activeSub) {
    if (activeSub.plan.id === plan.id) {
      return (
        <Button isDisabled>
          <div className="text-muted small">Expires on {moment(activeSub.expires_at).format('D/M/YYYY')}</div>
        </Button>
      )
    }

    if (activeSub.plan.max_txns > plan.max_txns) {
      return (
        <div style={{ opacity: 0 }}>
          <Button isDisabled>
            <div className="text-muted small">You have a better plan</div>
          </Button>
        </div>
      )
    }
  }

  if (totalTxns && totalTxns > plan.max_txns) {
    return (
      <div>
        <Button isDisabled>
          <div className="text-muted small">BUY NOW</div>
        </Button>
        <ErrorIcon text="You have too many transactions for this plan!" />
      </div>
    )
  }

  return (
    <StripeCheckoutBtn
      plan={plan}
      name="Koinly"
      description={`${plan.name} Plan - ${moment().format('D/M/YYYY')}`}
      stripeKey={process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY}
      currency="USD"
      amount={plan.final_price_in_cents}
      email={email}
      image={window.location.origin + logo}
      btnText={activeSub ? 'UPGRADE' : 'BUY NOW'}
    />
  )
}

const PlanItem = ({ plan, activeSub, loading, email, totalTxns }) => {
  let active = activeSub && activeSub.plan.id === plan.id
  let price = <span>${Number.parseInt(plan.final_price)}</span>
  if (active) {
    price = <span>${Number.parseInt(activeSub.amount_paid)}</span>
  } else if (parseInt(plan.price) > parseInt(plan.final_price)) {
    price = (
      <>
        <span className="small text-muted pr-2">
          <del>${Number.parseInt(plan.price)}</del>
        </span>
        <mark>${Number.parseInt(plan.final_price)}</mark>
      </>
    )
  }
  return (
    <div className="plan text-center whitebg" style={{ borderTopColor: planColor(plan) }}>
      <h4 className="title pt-1 pb-3">{plan.name}</h4>
      <div className="price pb-3">
        <h4 style={{ fontSize: '1.75rem' }}>
          {price}
          <span className="small text-muted"> / tax year</span>
        </h4>
      </div>
      <div className="pb-2 text-muted">
        <b>{active ? activeSub.max_txns : plan.max_txns}</b> transactions
      </div>
      <div className="pb-2 text-muted">All tax reports</div>
      <div className="pb-2 text-muted">{plan.name !== 'Hodler' && 'Priority support'}&nbsp;</div>
      <div className="pb-2 text-muted">
        {(plan.name === 'Oracle' || plan.name === 'Trader +') && (
          <>
            Custom imports <Info text={'Our engineers will prioritize your custom CSV or Excel files.'} />
          </>
        )}
        &nbsp;
      </div>
      <div className="pb-2 pt-3">
        <ActionBtn plan={plan} activeSub={activeSub} loading={loading} email={email} totalTxns={totalTxns} />
      </div>
    </div>
  )
}

export default PlanItem
