import React, { Component } from 'react'
import axios from 'axios'
import { toastr } from 'react-redux-toastr'
import _ from 'lodash'
import { Button } from 'reactstrap'
import ConfirmDialog from '../../../components/ConfirmDialog'

export default class RequestPayoutBtn extends Component {
  state = {
    loading: false,
  }

  canWithdraw() {
    return parseInt(this.props.credits.available) > 0
  }

  handleClick = () => {
    if (this.state.loading) return
    this.setState({ loading: true })
    axios
      .post('/api/payouts/')
      .then(response => {
        toastr.success('Payout request has been created. You will receive an email when its completed.')
        this.setState({ loading: false })
      })
      .catch(res => {
        toastr.error(_.get(res, 'response.data.errors[0].detail') || res.message)
        this.setState({ loading: false })
      })
  }

  render() {
    let credits = this.props.credits
    return (
      <ConfirmDialog
        text={
          <div>
            This will create a payout request for ${credits.available}. Do you want to proceed?
            {parseInt(credits.reserved) > 0 && (
              <div className="small text-muted pt-2">
                Your remaining commission: ${credits.reserved}, is currently locked and will be released once 30 days have past since you
                received it.
              </div>
            )}
          </div>
        }
        onConfirm={this.handleClick}
        tag={Button}
        color="success"
        size={'sm'}
        loading={this.state.loading}
      >
        Request payout
      </ConfirmDialog>
    )
  }
}
