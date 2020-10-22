import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import axios from 'axios'
import PageLoader from '../../components/PageLoader'
import { notifyError, notifyInfo } from '../../redux/reducers/notifier'
import { Badge } from 'reactstrap'
import { checkSyncStatus } from '../../redux/reducers/syncStatus'
import AppLayout from '../../layouts/AppLayout'
import PageHeader from '../../components/PageHeader'
import { Button } from '../../controls'
import InfoDialog from '../../components/InfoDialog'
import { LINKS } from '../../Constants'

const Issue = ({ title, subtitle, extra, actions }) => (
  <li className="mb-4">
    <div className={'border p-3 bg-white relative'}>
      <h4>{title}</h4>
      <div className="small text-muted my-2">{subtitle}</div>
      {extra && (
        <ul className="mb-2">
          {extra.map(item => (
            <li className={'small text-muted'} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      )}
      <div className={'small pt-2'}>
        {actions.map((action, idx) => (
          <>
            {action}
            {idx === actions.length - 1 ? '' : <span className="px-3 text-muted">•</span>}
          </>
        ))}
      </div>
    </div>
  </li>
)

class DebugWallet extends Component {
  state = {
    wallet: null,
  }

  onDeleteWallet = e => {
    e.preventDefault()
    if (this.state.deleting) return
    this.setState({ deleting: false })
    axios.delete(`/api/wallets/${this.props.match.params.id}`).then(res => {
      this.props.checkSyncStatus()
      this.props.notifyInfo(`Deleted wallet "${this.state.wallet.name}"`)
      if (this.props.location.state && this.props.location.state.returnTo) {
        this.props.history.push(this.props.location.state.returnTo)
      } else {
        this.props.history.goBack()
      }
      window.Intercom('trackEvent', 'wallet-deleted', { name: this.state.wallet.name })
    })
  }

  onDeleteTrades = e => {
    e.preventDefault()
    if (this.state.deletingTrades) return
    this.setState({ deletingTrades: true })
    axios.post(`/api/wallets/${this.props.match.params.id}/delete_existing_trades`).then(res => {
      this.props.checkSyncStatus()
      this.props.notifyInfo(`Successfully deleted old trades for "${this.state.wallet.name}"`)
      this.setState({ deletingTrades: false, wallet: null })
    })
  }

  onDeleteTxns = e => {
    e.preventDefault()
    if (this.state.deletingTxns) return
    this.setState({ deletingTxns: true })
    axios.post(`/api/wallets/${this.props.match.params.id}/delete_existing_txns`).then(res => {
      this.props.checkSyncStatus()
      this.props.notifyInfo(`Successfully deleted old transactions for "${this.state.wallet.name}"`)
      this.setState({ deletingTxns: false, wallet: null })
    })
  }

  onSync = e => {
    e.preventDefault()
    if (this.state.syncing) return
    this.setState({ syncing: true })
    axios.post(`/api/wallets/${this.props.match.params.id}/sync`).then(res => {
      this.props.notifyInfo(`Syncing "${this.state.wallet.name}", this may take a few minutes!`)
      this.props.checkSyncStatus()
      this.setState({ syncing: false })
    })
  }

  onResolve = e => {
    e.preventDefault()
    if (this.state.resolving) return
    this.setState({ resolving: true })
    axios.post(`/api/wallets/${this.props.match.params.id}/resolve`).then(res => {
      this.props.notifyInfo(`All issues in '${this.state.wallet.name}' have been marked as resolved`)
      this.props.history.goBack()
      this.setState({ resolving: false })
    })
  }

  onReviewManual = e => {
    e.preventDefault()
    this.props.history.push(`/transactions?manual=1&wallet_id=${this.props.match.params.id}`)
  }

  onReviewMissingCosts = e => {
    e.preventDefault()
    this.props.history.push(`/transactions?negative_balances=1&wallet_id=${this.props.match.params.id}`)
  }

  onReviewMissingRates = e => {
    e.preventDefault()
    this.props.history.push(`/transactions?missing_rates=1&wallet_id=${this.props.match.params.id}`)
  }

  onEditApi = e => {
    e.preventDefault()
    this.props.history.push(`/wallets/${this.props.match.params.id}/api`)
  }

  onRequestHelp = e => {
    e.preventDefault()
    this.setState({ showHelp: true })
  }

  createAction(name, onClick, className) {
    if (typeof onClick === 'string') {
      return (
        <Link to={onClick} className={className}>
          {name}
        </Link>
      )
    }
    return (
      <a href="#" onClick={onClick} className={className}>
        {name}
      </a>
    )
  }

  renderAction(action) {
    switch (action) {
      case 'upload':
        return this.createAction('Import transactions', `/wallets/${this.state.wallet.id}/upload`)
      case 'sync':
        return this.createAction('Sync now', this.onSync)
      case 'help':
        return this.createAction('Request help', this.onRequestHelp)
      case 'delete_wallet':
        return this.createAction('Delete wallet', this.onDeleteWallet, 'text-danger')
      case 'delete_existing_trades':
        return this.createAction('Delete existing trades', this.onDeleteTrades)
      case 'delete_existing_txns':
        return this.createAction('Delete existing transactions', this.onDeleteTxns)
      case 'review_manual':
        return this.createAction('Review manual transactions', this.onReviewManual)
      case 'review_missing_costs':
        return this.createAction('Review these transactions', this.onReviewMissingCosts)
      case 'review_missing_rates':
        return this.createAction('Review these transactions', this.onReviewMissingRates)
      case 'edit_api':
        return this.createAction('Edit API', this.onEditApi)
      default:
        window.Rollbar.error(`Unknown action in troubleshooter: ${action}`)
        return null
    }
  }

  renderWalletStats(wallet) {
    let baseUrl = `/transactions?wallet_id=${wallet.id}`
    return (
      <div className="pb-3">
        {wallet.api_connected ? (
          <Badge color="success" className="px-2 mr-1">
            API
          </Badge>
        ) : (
          <Badge color="warning" className="px-2 mr-1">
            CSV
          </Badge>
        )}
        <Badge color="info" className="px-2 mr-1" tag={Link} to={`${baseUrl}`}>
          {wallet.txn_count} transactions
        </Badge>
        {wallet.txn_details.deposits > 0 && (
          <Badge color="secondary" className="px-2 mr-1" tag={Link} to={`${baseUrl}&type=deposit`}>
            {wallet.txn_details.deposits} deposits
          </Badge>
        )}
        {wallet.txn_details.withdrawals > 0 && (
          <Badge color="secondary" className="px-2 mr-1" tag={Link} to={`${baseUrl}&type=withdrawal`}>
            {wallet.txn_details.withdrawals} withdrawals
          </Badge>
        )}
        {wallet.txn_details.trades > 0 && (
          <Badge color="secondary" className="px-2 mr-1" tag={Link} to={`${baseUrl}&type=trade`}>
            {wallet.txn_details.trades} trades
          </Badge>
        )}
        {wallet.txn_details.transfers > 0 && (
          <Badge color="secondary" className="px-2 mr-1" tag={Link} to={`${baseUrl}&type=transfer`}>
            {wallet.txn_details.transfers} transfers
          </Badge>
        )}
      </div>
    )
  }

  renderContent() {
    let wallet = this.state.wallet
    if (!wallet) {
      return <PageLoader url={`/api/wallets/${this.props.match.params.id}/issues`} onLoad={wallet => this.setState({ wallet })} />
    }

    let requestHelpItems = [
      `   > ---`,
      `   > Wallet: ${wallet.name} ${wallet.wallet_service && '(' + wallet.wallet_service.name + ')'}`,
      `   > Transactions: ${wallet.txn_count}`,
      `   > Imported with: ${wallet.api_connected ? 'API' : 'CSV'}`,
    ]

    wallet.errors.map((err, idx) => {
      requestHelpItems.push(`   > ${idx + 1}. ${err.error}`)
      {
        err.extra && err.extra.map(item => requestHelpItems.push(`   ---- ${item}`))
      }
    })

    return (
      <div className="page-body container">
        <div className="row">
          <div className="col">
            <PageHeader
              title={
                <>
                  Found {wallet.errors.length} issues in {wallet.name}
                </>
              }
              showBack
            />
            <div className="text-center" style={{ marginTop: '-30px', marginBottom: '30px' }}>
              {this.renderWalletStats(wallet)}
            </div>
            {wallet.errors.length === 0 && <div className="alert alert-success">No issues found in this wallet!</div>}
            <ol className="wallet-issue">
              {wallet.errors.map(issue => (
                <Issue
                  title={issue.error}
                  subtitle={issue.info}
                  extra={issue.extra}
                  actions={issue.actions.map(action => this.renderAction(action))}
                />
              ))}
            </ol>
            <InfoDialog
              open={this.state.showHelp}
              onClose={() => this.setState({ showHelp: false })}
              title={'Request help'}
              text={
                <p>
                  <b>For errors related to missing purchase history:</b>
                  <div className="small text-muted pb-3">
                    Start by reading this{' '}
                    <a href={LINKS.missing_txns} target={'_blank'}>
                      short article
                    </a>{' '}
                    which explains why you are missing purchase costs. You can usually just ignore small amounts. If you are missing history
                    for large amounts then proceed with your help request.
                  </div>
                  <b>How to request help:</b>
                  <ol>
                    <li className={'pb-2 small'}>
                      Go to{' '}
                      <a href={LINKS.community} target={'_blank'}>
                        Koinly Discuss
                      </a>
                    </li>
                    <li className={'pb-2 small'}>Login or create an account (your Koinly account wont work there)</li>
                    <li className={'pb-2 small'}>
                      Create a <b>New Topic</b> in the <b>Exchange issues</b> category. Also, check if there are any existing topics with
                      the same issue/solution.
                    </li>
                    <li className={'pb-2 small'}>
                      Give the topic a suitable title, ex:{' '}
                      <span className={'font-italic'}>{'Missing purchase history in ' + (wallet.wallet_service || wallet).name}</span>
                    </li>
                    <li className="pb-2 small">
                      Describe the problem and what you have done to resolve it so far. Copy/paste the following information as well:
                    </li>
                  </ol>
                  <div className={'small'}>
                    <textarea value={requestHelpItems.join('\n')} style={{ width: '100%', height: '200px' }} disabled />
                  </div>
                </p>
              }
            />
          </div>
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

export default connect(mapStateToProps, { notifyError, notifyInfo, checkSyncStatus })(withRouter(DebugWallet))
