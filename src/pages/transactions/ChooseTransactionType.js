import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { BuilderTransactionTypes } from '../../Constants'
import MediaButton from '../../components/MediaButton'
import PageHeader from '../../components/PageHeader'
import AppLayout from '../../layouts/AppLayout'

class ChooseTransactionType extends Component {
  DEPOSIT = {
    title: 'Deposit',
    subtitle: 'Received crypto in your wallet?',
    type: BuilderTransactionTypes.Deposit,
    faIcon: 'arrow-down',
    faColor: '#6fbf73',
  }

  WITHDRAWAL = {
    title: 'Send',
    subtitle: 'Sent crypto from your wallet?',
    type: BuilderTransactionTypes.Withdrawal,
    faIcon: 'arrow-up',
    faColor: '#f73378',
  }

  TRADE = {
    title: 'Trade',
    subtitle: 'Exchanged or sold crypto?',
    type: BuilderTransactionTypes.Trade,
    faIcon: 'exchange-alt',
    faColor: '#35baf6',
  }

  TRANSFER = {
    title: 'Transfer',
    subtitle: 'Moved crypto between wallets?',
    type: BuilderTransactionTypes.Transfer,
    faIcon: 'angle-double-right',
    faColor: '#8561c5',
  }

  EXCHANGES = {
    title: 'Connect wallets',
    subtitle: 'Binance, Coinbase & more',
    link: '/wallets/select',
    faType: 'fab',
    faIcon: 'hotjar',
  }

  BALANCES = {
    title: 'Add balances',
    subtitle: 'Quick way to add balances',
    link: '/balances',
    faIcon: 'dollar-sign',
  }

  MAIN_ITEMS = [this.DEPOSIT, this.WITHDRAWAL, this.TRADE]

  OTHER_ITEMS = [this.EXCHANGES]

  selectItem = item => {
    if (!item.disabled) {
      if (item.link) {
        this.props.history.replace(item.link)
      } else {
        switch (item.type) {
          case this.DEPOSIT.type:
          case this.WITHDRAWAL.type:
          case this.TRADE.type:
          case this.TRANSFER.type:
            return this.props.history.replace(`/transactions/new/${item.type}`)
        }
      }
    }
  }

  render() {
    return (
      <AppLayout>
        <div className="page-body container">
          <PageHeader
            title="Adding a manual transaction"
            subtitle="We recommend adding an exchange account or public address instead so Koinly can auto-sync your transactions."
          />
          <div className="row">
            {this.MAIN_ITEMS.map(item => (
              <MediaButton {...item} key={item.type} onClick={() => this.selectItem(item)} />
            ))}
          </div>
          <div className="row mt-3">
            <div className="col col-group-title">Other Options</div>
          </div>
          <div className="row well-grid">
            {this.OTHER_ITEMS.map(item => (
              <MediaButton {...item} onClick={() => this.selectItem(item)} />
            ))}
          </div>
        </div>
      </AppLayout>
    )
  }
}

export default withRouter(ChooseTransactionType)
