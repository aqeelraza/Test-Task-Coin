import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import connect from 'react-redux/es/connect/connect'
import PageLoader from '../../components/PageLoader'
import AppLayout from '../../layouts/AppLayout'
import PlanItem from './_helpers/Plan'
import _ from 'lodash'

class Index extends Component {
  state = {
    totalTxns: 0,
  }

  renderContent() {
    if (!this.state.plans) {
      return (
        <PageLoader
          url="/api/plans"
          onLoad={res =>
            this.setState({
              plans: res.plans,
              discount: _.get(res, 'meta.extra.discount'),
              credits: _.get(res, 'meta.extra.credits') || 0,
              totalTxns: _.get(res, 'meta.extra.total_txns') || 0,
            })
          }
        />
      )
    }

    return (
      <div className="page-body container">
        <PageHeader
          title="Choose your tax plan"
          subtitle={
            <span>
              You have {this.state.totalTxns} transactions. We are running a <b>limited-time discount</b> campaign that gives you access to
              tax reports for ALL past years + next year(!) when you buy any of these plans.
            </span>
          }
        />
        {this.state.discount && (
          <div className="text-center pb-4">
            <span className="alert alert-success">
              Yay! You are getting a <b>{this.state.discount}</b> discount on all plans!
            </span>
          </div>
        )}
        {parseInt(this.state.credits) > 0 && (
          <div className="text-center pb-4">
            <span className="alert alert-info">
              You have <b>${this.state.credits}</b> credits that will be applied automatically at checkout.
            </span>
          </div>
        )}
        <div className={`row d-flex justify-content-center align-items-center`}>
          {this.state.plans.map(item => (
            <div className="col-12 col-md-4 col-lg-3 px-2">
              <PlanItem
                key={item.id}
                plan={item}
                activeSub={this.props.session.active_subscription}
                loading={this.state.loading}
                email={this.props.session.email}
                onToken={token => this.onToken(item, token)}
                totalTxns={this.state.totalTxns}
              />
            </div>
          ))}
        </div>
        <div className="row d-flex justify-content-center align-items-center small text-muted">
          All prices are in USD.{' '}
          <Link className="pl-2" to={'/apply-coupon/'}>
            Enter coupon code
          </Link>
        </div>
        <div className="row text-muted text-center">
          <div className="col-6 mx-auto text-center"></div>
        </div>
      </div>
    )
  }

  render() {
    return <AppLayout>{this.renderContent()}</AppLayout>
  }
}

function mapStateToProps({ session }) {
  return { session }
}

export default connect(mapStateToProps)(Index)
