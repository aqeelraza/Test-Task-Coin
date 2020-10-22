import classNames from 'classnames'
import React from 'react'
import PageLoader from '../../../components/PageLoader'
import { Colors, formatMoney } from '../../../common'
import connect from 'react-redux/es/connect/connect'
import { TransactionTypes, AVERAGE_COST_METHODS, COST_BASIS_METHODS } from '../../../Constants'
import _ from 'lodash'
import EntryTable from '../../entries/_helpers/EntryTable'
import InvestmentTable from './InvestmentTable'
import { cleanLabel, getTxnIcon } from '../../../common'
import { Link } from 'react-router-dom'
import { Button } from 'reactstrap'
import ConfirmDialog from '../../../components/ConfirmDialog'
import Tooltip from '../../../components/Tooltip'
import TxnDetailsTable from './TxnDetailsTable'

class TxnSlidedown extends React.Component {
  state = {}

  getTxnSummary(txn) {
    let base = this.props.session.base_currency
    let session = this.props.session

    let summary = ''
    switch (txn.type) {
      case TransactionTypes.Exchange:
      case TransactionTypes.Buy:
      case TransactionTypes.Sell:
        let verb = {}
        verb[TransactionTypes.Exchange] = 'traded'
        verb[TransactionTypes.Buy] = 'bought'
        verb[TransactionTypes.Sell] = 'sold'
        let first = txn.from
        let second = txn.to
        if (txn.type === TransactionTypes.Buy) {
          first = txn.to
          second = txn.from
        }
        summary += `You ${verb[txn.type]} ${formatMoney(first.amount, first.currency)} for ${formatMoney(
          second.amount,
          second.currency
        )} (worth ${formatMoney(txn.net_value, base)})`
        if (txn.fee) {
          summary += ` and paid a fee of ${formatMoney(txn.fee.amount, txn.fee.currency)} (worth ${formatMoney(
            txn.fee_value,
            base
          )}) on top.`
        } else {
          summary += '.'
        }
        break
      case TransactionTypes.Transfer:
        summary += `You transferred ${formatMoney(txn.from.amount, txn.from.currency)} from ${txn.from.wallet.name} to ${
          txn.to.wallet.name
        }`
        if (txn.fee) {
          summary += ` and paid a transaction fee of ${formatMoney(txn.fee.amount, txn.fee.currency)} (worth ${formatMoney(
            txn.fee_value,
            base
          )}) on top.`
        } else {
          summary += '.'
        }
        break
      case TransactionTypes.CryptoDeposit:
      case TransactionTypes.FiatDeposit:
        if (txn.label !== 'realized_gain') {
          summary += `You bought or received ${formatMoney(txn.to.amount, txn.to.currency)} worth ${formatMoney(txn.net_value, base)}.`
        } else {
          summary += `You made a gain of ${formatMoney(txn.to.amount, txn.to.currency)} worth ${formatMoney(
            txn.net_value,
            base
          )} through margin trading.`
        }
        break
      case TransactionTypes.CryptoWithdrawal:
      case TransactionTypes.FiatWithdrawal:
        if (txn.label !== 'realized_gain') {
          summary += `You sent ${formatMoney(txn.from.amount, txn.from.currency)} worth ${formatMoney(txn.net_value, base)} to someone.`
        } else {
          summary += `You made a loss of ${formatMoney(txn.from.amount, txn.from.currency)} worth ${formatMoney(
            txn.net_value,
            base
          )} on margin trading.`
        }
        break
    }

    let averageCostMethod = AVERAGE_COST_METHODS.includes(session.cost_basis_method)
    if (
      txn.from &&
      txn.type !== TransactionTypes.Buy &&
      (txn.type !== TransactionTypes.Transfer || (session.realize_transfer_fees && txn.fee))
    ) {
      if (txn.type === TransactionTypes.Transfer) {
        summary += ` Your cost-basis for the ${formatMoney(txn.fee.amount, txn.fee.currency)} transaction fee`
      } else {
        summary += ` Your cost-basis for ${formatMoney(txn.from.amount, txn.from.currency)}`
        if (txn.fee) {
          summary += ` and the ${formatMoney(txn.fee.amount, txn.fee.currency)} fee`
        }
      }

      let method = COST_BASIS_METHODS.find(method => method.id === session.cost_basis_method) || {
        name: session.cost_basis_method.replace('_', '-'),
      }
      summary += ` has been calculated using ${method.name} (${session.account_based_cost_basis ? 'wallet based' : 'universal'})`

      if (averageCostMethod) {
        summary += `.`
      } else {
        summary += ' from the investments listed below.'
      }

      summary += ` Your final capital gain for this transaction is ${formatMoney(txn.gain, base)}.`
    }

    return summary
  }

  renderTxnDetailsTable(txn) {
    return <TxnDetailsTable txn={txn} session={this.props.session} />
  }

  getSourceInfo(source) {
    if (source === 'api') {
      return { title: 'API', color: 'badge-success' }
    } else if (source === 'csv') {
      return { title: 'CSV', color: 'badge-secondary' }
    } else {
      return { title: 'M', color: 'badge-info' }
    }
  }

  renderDetailsTab(txn) {
    let infoItems = []
    if (txn.txhash) {
      infoItems.push({
        title: 'Transaction Hash',
        content: (
          <>
            {txn.txhash}{' '}
            {txn.txurl && (
              <a href={txn.txurl} target="__blank">
                <i className={`fas fa-external-link-alt pl-2`} />
              </a>
            )}
          </>
        ),
      })
    }

    if (txn.txsrc) {
      infoItems.push({ title: 'Source', content: txn.txsrc })
    }

    if (txn.txdest) {
      infoItems.push({ title: 'Destination', content: txn.txdest })
    }

    if (txn.description) {
      infoItems.push({ title: 'Description', content: txn.description })
    }

    let fromSource = txn.from && this.getSourceInfo(txn.from_source)
    let toSource = txn.to && this.getSourceInfo(txn.to_source)
    let icon = getTxnIcon(txn.type)

    return (
      <>
        <h3 className="pt-2 mt-1">
          <i className={`${icon.icon} mr-3`} style={{ fontSize: '1em', color: icon.color }} />
          {txn.label ? cleanLabel(txn.label) : cleanLabel(txn.type)}
        </h3>
        {this.renderTxnDetailsTable(txn)}
        {infoItems.map((item, index) => (
          <div key={index} className={index === 0 ? 'mt-4' : 'mt-2'}>
            <div className="small text-muted">{item.title}</div>
            <div className="pt-1 pb-3">{item.content}</div>
          </div>
        ))}

        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="small">
            {fromSource && <div className={'badge badge-pill ' + fromSource.color}>{fromSource.title}</div>}
            {toSource && (!fromSource || fromSource.title !== toSource.title) && (
              <div className={'badge badge-pill ml-2 ' + toSource.color}>{toSource.title}</div>
            )}
          </div>
          <div>
            <Button
              outline
              color="info"
              size="sm"
              className="mr-2"
              tag={Link}
              to={{ pathname: `/transactions/${txn.id}/edit`, state: txn }}
            >
              EDIT
            </Button>
            {this.props.onDelete && (
              <Button outline color="danger" size="sm" className="mr-2" onClick={this.props.onDelete}>
                DELETE
              </Button>
            )}
          </div>
        </div>
      </>
    )
  }

  renderInvestmentsTab(txn) {
    if (this.props.session.active_subscription && !this.state.investments) {
      return <PageLoader url={`/api/investments?q[transaction_id_eq]=${txn.id}`} onLoad={data => this.setState({ investments: data })} />
    }

    let data = this.state.investments
    return (
      <>
        <div className="small mb-4">
          <b>Summary:</b> {this.getTxnSummary(txn)}
        </div>
        {data && (
          <>
            {data.investments.length === 0 && (
              <div className="mx-auto" style={{ textAlign: 'center' }}>
                <div className="text-muted pb-3">No investments for this transaction.</div>
              </div>
            )}
            {data.investments.length > 0 && <InvestmentTable items={data.investments} session={this.props.session} />}
            {Number.parseInt(data.meta.page.total_pages) > 1 && (
              <div className="text muted small mt-2">
                Showing {data.investments.length} of {data.meta.page.total_items} investments
              </div>
            )}
          </>
        )}
        {!data && (
          <div style={{ position: 'relative' }}>
            <div className="blur-bg">
              {this.renderTxnDetailsTable(txn)}
              {this.renderTxnDetailsTable(txn)}
            </div>
            <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', zIndex: '100' }}>
              <div className="d-flex justify-content-center">
                <div className="text-center">
                  <i className="fas fa-lock" style={{ fontSize: '80px', color: Colors.red }} />
                  <h3>Buy a tax plan to unlock full analysis!</h3>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  renderEntriesTab(txn) {
    if (!this.state.entries) {
      return <PageLoader url={`/api/entries?q[transaction_id_eq]=${txn.id}`} onLoad={data => this.setState({ entries: data })} />
    }

    let data = this.state.entries
    return (
      <>
        <div className="small mb-4">
          Koinly maintains a double entry ledger system for all your transactions. Every change in your asset balances due to this
          transaction is listed below.
          {txn.group_name && (
            <span>
              {txn.group_count} similar entries related to {txn.group_name} were merged together.
            </span>
          )}
        </div>
        {data.entries.length === 0 && (
          <div className="mx-auto" style={{ textAlign: 'center' }}>
            <div className="text-muted pb-3">No entries for this transaction.</div>
          </div>
        )}
        {data.entries.length > 0 && <EntryTable items={data.entries} />}
        {Number.parseInt(data.meta.page.total_pages) > 1 && (
          <div className="text muted small mt-2">
            Showing {data.entries.length} of {data.meta.page.total_items} entries
          </div>
        )}
      </>
    )
  }

  render() {
    let txn = this.props.txn
    let showCostAnalysis = txn.type !== TransactionTypes.FiatDeposit && txn.type !== TransactionTypes.FiatWithdrawal
    let tabs = [
      { name: 'Details', id: 'details' },
      { name: 'Ledger', id: 'entries' },
    ]

    if (showCostAnalysis) {
      tabs.push({ name: 'Cost Analysis', id: 'investments' })
    }

    let activeTab = this.state.activeTab || this.props.defaultTab || tabs[0].id

    return (
      <div
        style={{
          backgroundColor: '#f5f5f5',
          marginRight: '0',
          marginLeft: '0',
          borderRight: '1px solid #e9e9e9',
          borderLeft: '1px solid #e9e9e9',
          marginTop: '-1px',
        }}
      >
        <div className="d-flex justify-content-between">
          <ul className="transaction-slidedown-tabs pl-4 ml-2">
            {tabs.map(tab => (
              <li
                key={tab.id}
                className={classNames({
                  active: tab.id === activeTab,
                  'list-inline-item mr-2 px-2': true,
                })}
                onClick={() => this.setState({ activeTab: tab.id })}
              >
                {tab.name}
              </li>
            ))}
          </ul>
          <div className="small text-muted pr-4 pt-4 mr-3">
            <Link to={`/transactions/${txn.id}/edit`}>#{txn.id}</Link>
          </div>
        </div>

        <div className="px-4 mx-2 pb-4">
          {activeTab === 'details' && this.renderDetailsTab(txn)}
          {activeTab === 'investments' && showCostAnalysis && this.renderInvestmentsTab(txn)}
          {activeTab === 'entries' && this.renderEntriesTab(txn)}
        </div>
      </div>
    )
  }
}

function mapStateToProps({ session }) {
  return { session }
}

export default connect(mapStateToProps)(TxnSlidedown)
