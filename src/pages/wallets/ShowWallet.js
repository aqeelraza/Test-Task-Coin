import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import moment from 'moment'
import axios from 'axios'
import { formatMoney, math } from '../../common'
import PageLoader from '../../components/PageLoader'
import ConfirmDialog from '../../components/ConfirmDialog'
import { notifyError, notifyInfo } from '../../redux/reducers/notifier'
import { Badge, Button, UncontrolledDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap'
import { checkSyncStatus } from '../../redux/reducers/syncStatus'
import AppLayout from '../../layouts/AppLayout'
import ReactTable from 'react-table'
import Tooltip from '../../components/Tooltip'
import NiceDecimal from '../../components/NiceDecimal'
import { getWalletIcon } from '../../common'
import MissingBalances from './_helpers/MissingBalances'
import ButtonItem from './_helpers/ButtonItem'
import { formatApiError } from './_helpers'
import WarningIcon from '../../components/WarningIcon'

class ShowWallet extends Component {
  state = {
    wallet: null,
    deleting: false,
    menuOpen: false,
  }

  toggleMenu = () => {
    this.setState(prevState => ({ menuOpen: !prevState.menuOpen }))
  }

  onDelete = e => {
    e.preventDefault()
    this.setState({ deleting: false })
    axios.delete(`/api/wallets/${this.props.match.params.id}`).then(res => {
      this.props.checkSyncStatus()
      this.props.notifyInfo(`Successfully deleted wallet "${this.state.wallet.name}"`)
      this.props.history.goBack()
      window.Intercom('trackEvent', 'wallet-deleted', { name: this.state.wallet.name })
    })
  }

  onApiDelete = e => {
    e.preventDefault()
    this.setState({ deletingApi: false })
    axios.patch(`/api/wallets/${this.props.match.params.id}`, { wallet: { api_connected: false } }).then(res => {
      this.props.notifyInfo(`Auto sync has been disabled!`)
      this.setState({ wallet: { ...this.state.wallet, ...res.data } })
      window.Intercom('trackEvent', 'api-deleted', { name: this.state.wallet.name })
    })
  }

  onSync = e => {
    e.preventDefault()
    axios.post(`/api/wallets/${this.props.match.params.id}/sync`).then(res => {
      this.props.notifyInfo(`Syncing "${this.state.wallet.name}", this may take a few minutes!`)
      this.props.checkSyncStatus()
    })
  }

  onClearTransactions = e => {
    e.preventDefault()
    axios.post(`/api/wallets/${this.props.match.params.id}/clear`).then(res => {
      this.props.notifyInfo(`Your transactions are being removed, this can take a few seconds!`)
      this.props.checkSyncStatus()
      this.props.history.goBack()
    })
  }

  renderApiInfo(wallet) {
    if (!wallet.api_connected) {
      return (
        <ButtonItem
          title={'Setup auto-sync'}
          subtitle={'Let Koinly import your transactions automatically'}
          icon={'fa-sync-alt'}
          onClick={() => this.props.history.push({ pathname: `/wallets/${wallet.id}/api`, state: wallet })}
          badgeText={wallet.wallet_service.api_beta ? 'beta' : 'recommended'}
          badgeColor={wallet.wallet_service.api_beta ? 'danger' : 'success'}
        />
      )
    }

    return (
      <div className="well">
        <i
          className={`pl-2 fa ${wallet.last_error ? 'fa-exclamation-circle text-danger' : 'fa-check-circle text-success'}`}
          style={{ fontSize: '1.25rem', width: '45px' }}
        />
        <div className="media-body">
          Auto-sync {wallet.last_error ? 'error' : 'enabled'}
          <div className="text-muted small pt-1">
            <div className="overflow-ellipsis d-inline-block" style={{ maxWidth: '125px', width: 'auto', verticalAlign: 'top' }}>
              {wallet.display_address}
            </div>
            <div className="d-inline-block">
              {wallet.display_address && <span className="px-2">•</span>}
              Synced {wallet.synced_at ? moment(wallet.synced_at).fromNow() : 'never'}
            </div>
          </div>
          {wallet.last_error || wallet.auth_failed ? formatApiError(wallet) : null}
        </div>
        <UncontrolledDropdown className="text-muted">
          <DropdownToggle nav className="p-0">
            <i className={`fa fa-ellipsis-v px-2 ml-auto`} />
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem onClick={this.onSync}>Sync now</DropdownItem>
            <DropdownItem tag={Link} to={{ pathname: `/wallets/${wallet.id}/api`, state: wallet }}>
              Edit
            </DropdownItem>
            <DropdownItem onClick={() => this.setState({ removeAutoSyncDlg: true })}>Disable</DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
        <ConfirmDialog
          text="Are you sure you want to remove auto-sync for this wallet?"
          open={this.state.removeAutoSyncDlg}
          onConfirm={this.onApiDelete}
          onClose={() => this.setState({ removeAutoSyncDlg: false })}
        />
      </div>
    )
  }

  renderBalance = item => {
    let round = item.currency.fiat ? 2 : 8
    let mismatchAmount = item.reported_balance && math.sub(item.reported_balance, item.balance)
    let mismatch = mismatchAmount && math.abs(mismatchAmount) > (item.currency.fiat ? 0.1 : 0.00001)
    let balIsHigher = mismatch && math.decimal(item.balance) > math.decimal(item.reported_balance)
    let mismatchString = mismatch && (
      <>
        Calculated balance: {math.toString(math.decimal(item.balance, round))}
        <br />
        <br />
        The balance calculated from the imported transactions for this coin is {balIsHigher ? 'HIGHER' : 'LOWER'} than your actual balance
        by {math.toString(math.abs(mismatchAmount, round))} {item.currency.symbol}
        <br />
        <br />
        Compare your balance changes for this coin by clicking on the search icon to the right.
      </>
    )
    return (
      <>
        <NiceDecimal number={item.reported_balance || item.balance} decimals={8} />
        {mismatch ? <WarningIcon text={mismatchString} /> : null}
      </>
    )
  }

  renderTable(wallet, assets) {
    let base = this.props.session.base_currency
    return (
      <ReactTable
        data={assets}
        columns={[
          {
            id: 'coin',
            Header: 'Coin',
            accessor: 'currency.symbol',
            headerClassName: 'text-left',
            Cell: ({ original }) => (
              <Fragment>
                <img className="asset-icon" src={original.currency.icon} alt={original.currency.name} />
                <Tooltip content={original.currency.name} tag="span">
                  <span>{original.currency.symbol}</span>
                </Tooltip>
              </Fragment>
            ),
          },
          {
            id: 'balance',
            Header: 'Balance',
            accessor: item => math.decimal(item.reported_balance || item.balance),
            headerClassName: 'text-right',
            className: 'text-right',
            Cell: ({ original }) => this.renderBalance(original),
          },
          {
            id: 'value',
            Header: `Value (${base.symbol})`,
            accessor: item => math.decimal(item.value),
            headerClassName: 'text-right',
            className: 'text-right',
            Cell: ({ original }) => <NiceDecimal number={original.value} decimals={2} info={formatMoney(original.value, base)} />,
          },
          {
            id: 'action',
            Header: '',
            width: 30,
            className: 'text-right',
            Cell: ({ original }) => (
              <Tooltip content={'View balance history'}>
                <Link to={{ pathname: `/entries/${original.id}`, state: { ...original, wallet: this.state.wallet } }}>
                  <i className={`fa fa-search px-2 text-muted small`} />
                </Link>
              </Tooltip>
            ),
          },
        ]}
        defaultSorted={[{ id: 'value', desc: true }]}
        className="-highlight"
        showPagination={false}
        resizable={false}
        pageSize={assets.length}
        getTheadTrProps={() => {
          return { className: 'text-muted small px-2' }
        }}
        getTrProps={() => {
          return { className: 'px-2 py-1' }
        }}
      />
    )
  }

  renderWalletStats(wallet) {
    let baseUrl = `/transactions?wallet_id=${wallet.id}`
    return (
      <div className="text-muted px-2 pb-3">
        <Badge color="info" className="px-2 mx-1" tag={Link} to={`${baseUrl}`}>
          {wallet.txn_count} transactions
        </Badge>
        {wallet.txn_details.deposits > 0 && (
          <Badge color="secondary" className="px-2 mx-1" tag={Link} to={`${baseUrl}&type=deposit`}>
            {wallet.txn_details.deposits} deposits
          </Badge>
        )}
        {wallet.txn_details.withdrawals > 0 && (
          <Badge color="secondary" className="px-2 mx-1" tag={Link} to={`${baseUrl}&type=withdrawal`}>
            {wallet.txn_details.withdrawals} withdrawals
          </Badge>
        )}
        {wallet.txn_details.trades > 0 && (
          <Badge color="secondary" className="px-2 mx-1" tag={Link} to={`${baseUrl}&type=trade`}>
            {wallet.txn_details.trades} trades
          </Badge>
        )}
        {wallet.txn_details.transfers > 0 && (
          <Badge color="secondary" className="px-2 mx-1" tag={Link} to={`${baseUrl}&type=transfer`}>
            {wallet.txn_details.transfers} transfers
          </Badge>
        )}
      </div>
    )
  }

  renderContent() {
    // dont user location.state here - causes issues when user makes changes to wallet
    const wallet = this.state.wallet
    if (!wallet) {
      return <PageLoader url={`/api/wallets/${this.props.match.params.id}`} onLoad={wallet => this.setState({ wallet })} />
    }

    const service = wallet.wallet_service
    let totalValue = 0
    let totalFees = 0
    wallet.accounts.forEach(account => {
      account.current_rate = math.div(account.currency.usd_rate, this.props.session.base_currency.usd_rate)
      account.value = math.mul(account.reported_balance || account.balance, account.current_rate)
      totalValue += account.value
      totalFees += math.mul(account.fees, account.current_rate)
    })
    const formattedTotalVal = formatMoney(totalValue, this.props.session.base_currency)
    let accounts = wallet.accounts.sort((a, b) => b.value - a.value)
    const formattedFees = formatMoney(totalFees, this.props.session.base_currency)

    return (
      <div className="page-body container">
        <div className="row">
          <div className="col mb-3 pb-2 d-flex align-items-center">
            <i className="fa fa-chevron-left small pr-4 py-2 pointer" style={{ fontSize: '1.5rem' }} onClick={this.props.history.goBack} />
            {getWalletIcon(wallet, 60)}
            <div>
              <h2 className="mb-0" style={{ lineHeight: 'inherit' }}>
                {wallet.name}
              </h2>
              <div className="text-muted small">Added {moment(wallet.created_at).fromNow()}</div>
            </div>
            <div className="ml-auto">
              <Button
                outline
                color="info"
                size="sm"
                className="mr-2"
                tag={Link}
                to={{ pathname: `/wallets/${wallet.id}/edit`, state: wallet }}
              >
                EDIT
              </Button>
              <ConfirmDialog
                text="Are you sure you want to delete this wallet?"
                onConfirm={this.onDelete}
                tag={Button}
                outline
                color="danger"
                size="sm"
                className="mr-2"
              >
                DELETE
              </ConfirmDialog>
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-6 pt-4 pt-md-0">
            {this.renderWalletStats(wallet)}
            {service && service.api_active && this.renderApiInfo(wallet)}
            <ButtonItem
              title={'Import data from file'}
              icon={'fa-file-upload'}
              className={'mt-2'}
              onClick={() => this.props.history.push({ pathname: `/wallets/${wallet.id}/upload`, state: wallet })}
            />

            <ButtonItem
              title={'Troubleshoot issues'}
              subtitle={'Koinly will find and highlight common issues in this wallet.'}
              icon={'fa-hammer'}
              className={'mt-2'}
              onClick={() => this.props.history.push({ pathname: `/wallets/${wallet.id}/troubleshoot`, state: { returnTo: '/wallets' } })}
            />

            <ConfirmDialog
              text={
                'This will remove all transactions in this wallet. You will need to sync or import everything again. Are you sure you want to continue?'
              }
              onConfirm={this.onClearTransactions}
              className="text-danger small"
              tag={'a'}
              href={'#'}
            >
              Remove all transactions
            </ConfirmDialog>
          </div>
          <div className="col-md-6 pt-4 pt-md-0">
            <div className="d-flex justify-content-between px-3 pb-2">
              <h5>
                <i className="fas fa-university pr-2" />
                Holdings
                {wallet.balance_diff && <MissingBalances wallet={wallet} />}
              </h5>
              <h5>{formattedTotalVal}</h5>
            </div>

            <div className="border rounded whitebg p-2">
              {accounts.length === 0 && (
                <div className="mx-auto pt-3" style={{ textAlign: 'center' }}>
                  <div className="text-muted pb-3">This wallet is empty!</div>
                </div>
              )}
              {accounts.length > 0 && this.renderTable(wallet, accounts)}
            </div>
            <div className="d-flex justify-content-between text-muted small px-4 pt-2">
              <div>Total fees</div>
              <div className="ml-3">{formattedFees}</div>
            </div>
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

export default connect(mapStateToProps, { notifyError, notifyInfo, checkSyncStatus })(withRouter(ShowWallet))
