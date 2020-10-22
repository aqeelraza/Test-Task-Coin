import React from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toastr } from 'react-redux-toastr'
import moment from 'moment'
import { checkSyncStatus } from '../../../redux/reducers/syncStatus'
import connect from 'react-redux/es/connect/connect'
import { LINKS } from '../../../Constants'

class TxnQuickFix extends React.Component {
  state = {
    moreInfo: false,
    errorSummary: null,
  }

  showMoreInfo = e => {
    e.preventDefault()
    this.loadErrorSummary()
    this.setState({ moreInfo: true })
  }

  fixBalance(e, entry) {
    e.preventDefault()
    let date = new Date(entry.earliest_date)
    date.setMinutes(date.getMinutes() - 1)

    let data = {
      date: date.toISOString(),
      to_amount: Math.abs(entry.balance),
      to_currency_id: entry.currency_id,
      wallet_id: entry.wallet_id,
      type: 'deposit',
    }
    axios
      .post('/api/transactions', { transaction: data })
      .then(response => {
        this.props.checkSyncStatus()
        toastr.success('Successfully added deposit!')
        // remove the entry from summary
        this.setState(state => {
          return { errorSummary: state.errorSummary.filter(e => e !== entry) }
        })
      })
      .catch(error => {
        toastr.error('Failed to create deposit!')
      })
  }

  loadErrorSummary() {
    axios.get('/api/wallets/error_summary').then(res => this.setState({ errorSummary: res.data }))
  }

  renderMoreInfo() {
    if (!this.state.errorSummary) {
      return (
        <div className="spinner-border text-secondary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      )
    }

    let groupedWallets = {}
    this.state.errorSummary.forEach(entry => {
      if (!groupedWallets[entry.wallet_id]) {
        groupedWallets[entry.wallet_id] = { id: entry.wallet_id, name: entry.wallet_name, entries: [] }
      }
      groupedWallets[entry.wallet_id].entries.push(entry)
    })

    return (
      <div>
        This is a list of the wallets that have had negative balances. The amount/date shown is for the transaction that resulted in the
        highest negative balance ever for the specified currency.
        <div className="small py-2">
          Note:{' '}
          <i>
            <b>Quick Fix</b>
          </i>{' '}
          will simply create a Deposit transaction to offset the negative balance. This can result in incorrect gains as we dont know the
          correct date to add it on! If you want accurate gains you should create a Deposit transaction yourself with the correct date or
          edit the deposit transaction afterwards.
        </div>
        {Object.keys(groupedWallets).map(key => (
          <div className="pt-2">
            <div className="text-uppercase small">{groupedWallets[key].name}</div>
            {groupedWallets[key].entries.map(entry => (
              <div>
                {entry.symbol}: {entry.balance} on {moment(entry.highest_date).format('YYYY-MM-DD HH:mm')}
                <Link to={''} onClick={e => this.fixBalance(e, entry)}>
                  {' '}
                  Quick Fix
                </Link>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  render() {
    return (
      <div className="alert alert-info">
        {this.state.moreInfo && this.renderMoreInfo()}
        {!this.state.moreInfo && (
          <span>
            If you see a lot of{' '}
            <a target="_BLANK" href={LINKS.negative_balance}>
              negative balance errors
            </a>
            , it may be due to missing transactions or{' '}
            <a target="_BLANK" href={LINKS.api_limitations}>
              Exchange API Limitations
            </a>
            . For minor errors you can use{' '}
            <Link to={''} onClick={this.showMoreInfo}>
              Quick Fix
            </Link>
            .
          </span>
        )}
      </div>
    )
  }
}

export default connect(null, { checkSyncStatus })(TxnQuickFix)
