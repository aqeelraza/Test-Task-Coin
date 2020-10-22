import React, { Component, Fragment } from 'react'
import moment from 'moment'
import { Link, withRouter } from 'react-router-dom'
import axios from 'axios'
import { connect } from 'react-redux'
import AvatarGroup from '@atlaskit/avatar-group'
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Badge } from 'reactstrap'
import ConfirmDialog from '../../../components/ConfirmDialog'
import { formatMoney, math } from '../../../common'
import { notifyError, notifyInfo } from '../../../redux/reducers/notifier'
import { checkSyncStatus } from '../../../redux/reducers/syncStatus'
import MissingBalances from './MissingBalances'
import { getWalletIcon } from '../../../common'
import { formatApiError } from './index'

class Wallet extends Component {
  state = {}

  onDelete = () => {
    if (this.state.deleting) return
    this.setState({ deleting: true })
    axios
      .delete(`/api/wallets/${this.props.item.id}`)
      .then(res => {
        this.props.checkSyncStatus()
        this.props.notifyInfo(`Successfully deleted wallet "${this.props.item.name}"`)
        this.props.onItemDeleted()
        window.Intercom('trackEvent', 'wallet-deleted', { name: this.props.item.name })
      })
      .finally(() => this.setState({ deleting: false }))
  }

  onSync = e => {
    e.preventDefault()
    axios
      .post(`/api/wallets/${this.props.item.id}/sync`)
      .then(res => {
        this.props.checkSyncStatus()
        this.props.notifyInfo(`Syncing "${this.props.item.name}", please refresh the page in a few minutes!`)
      })
      .catch(res => {
        this.props.notifyError(res.message)
      })
  }

  render() {
    const wallet = this.props.item

    // let totalBalance = 0;
    // wallet.accounts.forEach(account => {
    //   account.current_rate = math.div(account.currency.usd_rate, this.props.session.base_currency.usd_rate);
    //   totalBalance += math.mul(account.balance, account.current_rate);
    // });
    // const totalBalanceCaption = formatMoney(
    //   math.decimal(totalBalance, 0),
    //   this.props.session.base_currency,
    //   { minimumFractionDigits: 0 }
    // );

    let iconData = []
    wallet.accounts.forEach(d => {
      if (math.abs(d.reported_balance || d.balance) > 0.000001) {
        iconData.push({
          key: d.id,
          name: formatMoney(d.reported_balance || d.balance, d.currency),
          src: d.currency.icon,
          appearance: 'circle',
          size: 'medium',
          enableTooltip: true,
        })
      }
    })

    return (
      <div className="row well">
        <div className="col-7 col-md-5">
          <div className="media align-items-center">
            {getWalletIcon(wallet, 50)}
            <div className="media-body">
              <Link to={`/wallets/${this.props.item.id}`}>{wallet.name}</Link>
              {wallet.balance_diff && <MissingBalances wallet={wallet} />}
              {wallet.api_connected && (
                <Fragment>
                  {wallet.display_address && <div className="text-muted small pt-1 overflow-ellipsis">{wallet.display_address}</div>}
                  <div className="text-muted small pt-1">
                    <Badge color={wallet.last_error ? 'danger' : 'info'} className="px-1 mr-1">
                      SYNCED
                    </Badge>
                    {wallet.synced_at && moment(wallet.synced_at).fromNow()}
                  </div>
                  {wallet.last_error && formatApiError(wallet)}
                </Fragment>
              )}
            </div>
          </div>
        </div>
        <div className="col-4 col-md-2">
          <div className="wallet-synced-at">
            <Link to={`/transactions?wallet_id=${wallet.id}`}>{wallet.txn_count} transactions</Link>
          </div>
        </div>
        <div className="col-md-4 d-none d-md-block avatar-group">
          {iconData.length > 0 ? (
            <AvatarGroup appearance="grid" maxCount={5} data={iconData} size="large" />
          ) : (
            <div className="text-muted small">No coins</div>
          )}
        </div>
        <div className="col-1">
          <UncontrolledDropdown className="text-muted float-right">
            <DropdownToggle nav>
              <i className="fas fa-ellipsis-v text-muted" />
            </DropdownToggle>
            <DropdownMenu>
              {wallet.api_connected && <DropdownItem onClick={this.onSync}>Sync wallet</DropdownItem>}
              <DropdownItem tag={Link} to={{ pathname: `/wallets/${wallet.id}/upload`, state: wallet }}>
                Import file
              </DropdownItem>
              <DropdownItem onClick={() => this.setState({ deleteDlg: true })}>Delete</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
          <ConfirmDialog
            text="Are you sure you want to delete this wallet?"
            open={this.state.deleteDlg}
            onConfirm={this.onDelete}
            onClose={() => this.setState({ deleteDlg: false })}
          />
        </div>
      </div>
    )
  }
}

function mapStateToProps({ session }) {
  return { session }
}
export default connect(mapStateToProps, { notifyError, notifyInfo, checkSyncStatus })(withRouter(Wallet))
