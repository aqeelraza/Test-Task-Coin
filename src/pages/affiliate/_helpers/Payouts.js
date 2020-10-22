import React, { Component } from 'react'
import moment from 'moment'
import { Badge } from 'reactstrap'
import PageLoader from '../../../components/PageLoader'

export default class Payouts extends Component {
  state = {
    payouts: null,
  }

  render() {
    if (!this.state.payouts) {
      return <PageLoader url={`/api/payouts/`} onLoad={res => this.setState({ payouts: res.payouts })} />
    }

    if (this.state.payouts.length === 0) {
      return <div className="text-muted">No payouts yet</div>
    }

    return (
      <table className="table border bg-white">
        <thead>
          <th scope="col">Date</th>
          <th scope="col">Amount</th>
          <th scope="col">Details</th>
          <th scope="col">Status</th>
        </thead>
        <tbody>
          {this.state.payouts.map(payout => (
            <tr>
              <td>{moment(payout.created_at).format('DD/MM/YYYY HH:mm')}</td>
              <td>${payout.amount}</td>
              <td>{payout.description}</td>
              <td>{payout.processed_at ? <Badge color={'success'}>complete</Badge> : <Badge color={'warning'}>pending</Badge>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }
}
