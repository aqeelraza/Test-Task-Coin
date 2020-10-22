import React, { Component, Fragment } from 'react'
import moment from 'moment'
import connect from 'react-redux/es/connect/connect'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, ModalHeader, ModalBody, ModalFooter, Modal } from 'reactstrap'
import {
  DEPOSIT_LABELS,
  WITHDRAW_LABELS,
  TransactionTypes,
  LabelIconsMap,
  FIAT_WITHDRAW_LABELS,
  FIAT_DEPOSIT_LABELS,
  LINKS,
} from '../../../Constants'
import { Colors, formatMoney, getDeltaColor, math } from '../../../common'
import ConfirmDialog from '../../../components/ConfirmDialog'
import RoundFaIcon from '../../../components/RoundFaIcon'
import Blockies from 'react-blockies'
import classNames from 'classnames'
import { toastr } from 'react-redux-toastr'
import Tooltip from '../../../components/Tooltip'
import Info from '../../../components/Info'
import { checkSyncStatus } from '../../../redux/reducers/syncStatus'
import { cleanLabel, getCostBasisMethodName, getTxnIcon } from '../../../common'
import { SlideDown } from 'react-slidedown'
import 'react-slidedown/lib/slidedown.css'
import TxnSlidedown from './TxnSlidedown'
import _ from 'lodash'
import { validServerToken } from '../../../common/csrf-token'
import { Button } from '../../../controls'

function getDisplayLabel(label, info) {
  let title = info
  if (label) {
    title = <strong>{cleanLabel(label)}</strong>
    if (info) {
      return (
        <span>
          {title} <span className="text-muted small pl-1">{info}</span>
        </span>
      )
    }
  }
  return title
}

function mustDisplayGains(txn, user) {
  return (
    txn.type === TransactionTypes.CryptoWithdrawal ||
    txn.type === TransactionTypes.Sell ||
    (txn.type === TransactionTypes.Exchange && user.realize_gains_on_exchange) ||
    (txn.type === TransactionTypes.Transfer && ((txn.fee && user.realize_transfer_fees) || user.account_based_cost_basis))
  )
}

const InfoItem = ({ icon, faIcon, heading, title, subtitle, url, costBasis, fee, gain, gainColor, muted, iconRight, strike }) => (
  <div className="media align-items-center">
    {icon && !iconRight && (typeof icon === 'string' ? <img src={icon} width={35} className="mr-2" /> : icon)}
    {faIcon && !iconRight && (
      <div
        className="mr-2"
        style={{
          fontSize: '2.2em',
          color: Colors.mutedIcon,
        }}
      >
        <i className={faIcon} />
      </div>
    )}
    <div className="media-body">
      {heading && <div className="text-muted small text-uppercase mb-1">{heading}</div>}
      {title && (
        <div className="txn-part">
          <div className={classNames({ 'txn-part-title': true, 'text-muted': muted })}>{strike ? <del>{title}</del> : title}</div>
          {url && (
            <a href={url} target="__blank">
              <i className={`fas fa-external-link-alt pl-2`} />
            </a>
          )}
        </div>
      )}
      {subtitle && <div className="text-muted mb-1">{subtitle}</div>}
      {(costBasis || gain) && !strike && (
        <div className="text-muted small mb-1">
          {costBasis}
          {gain && costBasis && (
            <span className={'px-2'} style={{ opacity: '0.5' }}>
              {' '}
              •{' '}
            </span>
          )}
          {gain && (
            <span style={{ color: gainColor }}>
              <b>{gain}</b>
            </span>
          )}
        </div>
      )}
    </div>
    {icon && iconRight && (typeof icon === 'string' ? <img src={icon} width={35} className={'ml-2'} /> : icon)}
    {faIcon && iconRight && (
      <div
        className="ml-2"
        style={{
          fontSize: '2.2em',
          color: Colors.mutedIcon,
        }}
      >
        <i className={faIcon} />
      </div>
    )}
  </div>
)

function reviewTxnHistoryLink(txn, account_id) {
  let date = moment(txn.date)
    .add(1, 'm')
    .toISOString()
  return `/transactions?account_id=${account_id}&to=${date}`
}

const NegativeBalanceInfo = ({ txn, showMoreInfo }) => {
  let info = txn.negative_balances
  let before = math.sub(info.balance, info.amount)
  let neg = before < 0 ? info.amount : math.add(before, info.amount)
  return (
    <div className="pt-2 px-1 small text-danger">
      <i className={`fas fa-exclamation-triangle mr-1`} />
      Missing purchase history for {math.toString(math.abs(neg, 8))} {info.symbol}
      <a href={LINKS.missing_txns} target={'_BLANK'} onClick={e => e.stopPropagation()} className={'pl-2'}>
        Learn more
      </a>{' '}
      •{' '}
      <Link to={reviewTxnHistoryLink(txn, info.account_id)} onClick={e => e.stopPropagation()}>
        View prior transactions
      </Link>
    </div>
  )
}

const MissingRatesInfo = ({ txn }) => {
  return (
    <div className="pt-2 px-1 small text-danger">
      <i className={`fas fa-exclamation-triangle mr-1`} />
      No market price found for {_.get(txn.from || txn.to, 'currency.symbol')} on this date.{' '}
      <a href={LINKS.missing_market_prices} target={'_BLANK'} onClick={e => e.stopPropagation()}>
        Learn more
      </a>
    </div>
  )
}

const MissingCostBasisInfo = ({ txn }) => {
  return (
    <div className="text-muted pt-2 px-1 small">
      <div style={{ color: Colors.red }}>
        <RoundFaIcon icon={'exclamation'} size="0.7em" color={Colors.red} />
        This transaction is missing partial or full cost-basis.
        <Info
          text={
            <Fragment>
              This means you do not have some or all of the funds that you are sending. Ensure you do not have missing txn errors prior to
              this date and that you have not received the funds that you are using here at the exact same time as this txn.
            </Fragment>
          }
        />
      </div>
    </div>
  )
}

class Transaction extends Component {
  state = {}

  onDelete = () => {
    if (this.state.deleting) return
    this.setState({ deleting: true })
    axios
      .delete(`/api/transactions/${this.props.item.id}`)
      .then(res => {
        this.props.checkSyncStatus()
        toastr.success('Successfully deleted transaction!')
        this.props.onItemDeleted()
      })
      .finally(() => this.setState({ deleting: false, showDeleteConfirm: false }))
  }

  setLabel = label => {
    axios.put(`/api/transactions/${this.props.item.id}`, { transaction: { label: label } }).then(res => {
      this.props.checkSyncStatus()
      toastr.success('Successfully updated transaction!')
      this.props.onItemUpdated(res.data)
    })
  }

  ignore = () => {
    if (this.state.ignoring) return
    this.setState({ ignoring: true })
    axios
      .post(`/api/transactions/${this.props.item.id}/ignore`)
      .then(res => {
        this.props.checkSyncStatus()
        toastr.success('Successfully deleted transaction!')
        this.props.onItemUpdated(res.data)
      })
      .finally(() => this.setState({ ignoring: false, showDeleteConfirm: false }))
  }

  unignore = () => {
    if (this.state.unignoring) return
    this.setState({ unignoring: true })
    axios
      .post(`/api/transactions/${this.props.item.id}/unignore`)
      .then(res => {
        this.props.checkSyncStatus()
        toastr.success('Successfully restored transaction!')
        this.props.onItemUpdated(res.data)
      })
      .finally(() => this.setState({ unignoring: false }))
  }

  promptDelete = () => {
    this.setState({ showDeleteConfirm: true })
  }

  closeDelete = () => {
    this.setState({ showDeleteConfirm: false, promptPermDelete: false })
  }

  renderDeleteConfirm = txn => {
    if ((txn.ignored || this.state.promptPermDelete) && txn.imported) {
      return (
        <ConfirmDialog
          text={
            <div>
              Permanently deleting this transaction could result in it being re-created on next API sync or file import. Are you sure you
              want to continue?
              <div className="small pt-2 text-muted">This action cannot be reversed.</div>
            </div>
          }
          open={this.state.showDeleteConfirm}
          onConfirm={this.onDelete}
          onClose={this.closeDelete}
        />
      )
    } else if (!txn.imported) {
      return (
        <ConfirmDialog
          text={
            <div>
              Are you sure you want to delete this transaction?
              <div className="small pt-2 text-muted">This action cannot be reversed.</div>
            </div>
          }
          open={this.state.showDeleteConfirm}
          onConfirm={this.onDelete}
          onClose={this.closeDelete}
        />
      )
    } else {
      // need to show both soft delete and perma delete options
      return (
        <Modal isOpen={this.state.showDeleteConfirm} toggle={this.closeDelete}>
          <ModalHeader toggle={this.closeDelete}>Confirm</ModalHeader>
          <ModalBody>
            You are about to delete an imported transaction.
            <div className="pt-2 small text-muted">
              The <b>Soft-delete</b> option will prevent this transaction from being re-created on next API sync (or file import) and also
              allows you to restore it manually later on. This is the recommended option.
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="link" className="mr-3" onClick={() => this.setState({ promptPermDelete: true })}>
              <span className="text-danger small">Delete permanently</span>
            </Button>
            <Button color="primary" onClick={this.ignore}>
              Soft delete
            </Button>
          </ModalFooter>
        </Modal>
      )
    }
  }

  getFromHtml() {
    const txn = this.props.item
    let fiat = txn.type === TransactionTypes.FiatDeposit
    if (txn.type === TransactionTypes.CryptoDeposit || fiat) {
      let icon = txn.txsrc && !fiat && <Blockies size={7} scale={5} seed={txn.txsrc} className="identicon ml-2" />
      return (
        <InfoItem
          title={getDisplayLabel(txn.label, txn.txsrc)}
          url={txn.txurl}
          icon={icon}
          faIcon={!icon && (fiat ? LabelIconsMap[txn.label || 'bank'] : LabelIconsMap[txn.label || 'unknown'])}
          strike={txn.ignored}
          muted
          iconRight
        />
      )
    } else if (!txn.from) {
      return null
    }

    let costBasis = null
    let info = null
    let costMethod = getCostBasisMethodName(this.props.session)
    if (!math.zero(txn.from.cost_basis) || mustDisplayGains(txn, this.props.session)) {
      if (txn.type === TransactionTypes.Transfer && !this.props.session.account_based_cost_basis) {
        costBasis = `${formatMoney(txn.from.cost_basis, this.props.baseCurrency)} fee cost basis`
        info = `This is the cost of the transaction fee amount, calculated using ${costMethod}`
      } else {
        costBasis = `${formatMoney(txn.from.cost_basis, this.props.baseCurrency)} cost basis`
        info = `This is the original cost of these coins, calculated using ${costMethod}`
      }
    }

    let fromAmount = txn.from.amount
    if (txn.type === TransactionTypes.Transfer && txn.fee && txn.fee.currency_id === txn.from.currency_id) {
      fromAmount = math.add(txn.from.amount, txn.fee.amount)
    }

    return (
      <InfoItem
        heading={txn.from.wallet.name}
        title={`- ${formatMoney(fromAmount, txn.from.currency)}`}
        icon={txn.from.currency.icon}
        costBasis={
          costBasis && (
            <Tooltip content={info} tag={'span'}>
              <span>{costBasis}</span>
            </Tooltip>
          )
        }
        strike={txn.ignored}
        iconRight
      />
    )
  }

  getToHtml() {
    const txn = this.props.item
    let gain = !math.zero(txn.gain) && formatMoney(math.abs(txn.gain), this.props.baseCurrency) + (math.pos(txn.gain) ? ' profit' : ' loss')
    if (!gain && mustDisplayGains(txn, this.props.session)) {
      if (txn.gain === null || txn.gain === undefined) {
        gain = (
          <span className="small text-italic text-muted">
            <div className={'spinner-border spinner-border-xs text-success'} /> Calculating
          </span>
        )
      } else {
        gain = 'No gain'
      }
    }

    if (txn.type === TransactionTypes.FiatWithdrawal) {
      return (
        <InfoItem
          title={getDisplayLabel(txn.label, txn.txdest)}
          faIcon={LabelIconsMap[txn.label || 'bank']}
          gain={gain}
          gainColor={getDeltaColor(txn.gain)}
          strike={txn.ignored}
          muted
        />
      )
    }

    // we use cost_basis here instead of txn.net_value because it also includes fee_value
    // and it is a better representation of the value used to calculate the gain for the txn
    let netValue = txn.from && math.add(txn.from.cost_basis, txn.gain)

    if (txn.type === TransactionTypes.CryptoWithdrawal) {
      let icon = !txn.label && txn.txdest && <Blockies size={7} scale={5} seed={txn.txdest} className="identicon mr-2" />
      let costBasis = '≈ ' + formatMoney(netValue, this.props.baseCurrency)

      costBasis = (
        <Tooltip content={'This is the market price of the sent coins. You can change this by editing the transaction.'} tag={'span'}>
          <span>{costBasis}</span>
        </Tooltip>
      )

      return (
        <InfoItem
          title={getDisplayLabel(txn.label, txn.txdest)}
          url={txn.txurl}
          icon={icon}
          faIcon={!icon && LabelIconsMap[txn.label || 'unknown']}
          costBasis={txn.label !== 'realized_gain' && costBasis}
          gain={gain}
          gainColor={getDeltaColor(txn.gain)}
          strike={txn.ignored}
          muted
        />
      )
    }

    let value = null
    let info = null
    switch (txn.type) {
      case TransactionTypes.CryptoDeposit:
        value = '≈ ' + formatMoney(txn.to.cost_basis, this.props.baseCurrency)
        info = 'This is the value of the deposited coins'
        break
      case TransactionTypes.Sell:
        // dont show net value if its same as the selling price
        if (!math.same(txn.to.amount, netValue, 2) || txn.to.currency.id !== this.props.baseCurrency.id) {
          value = '≈ ' + formatMoney(netValue, this.props.baseCurrency)
          info = 'This is how much you sold your coins for after fees'
        }
        break
      case TransactionTypes.Buy:
        value = '≈ ' + formatMoney(txn.to.cost_basis, this.props.baseCurrency)
        info = 'This is your total cost for these coins: Amount paid + fees'
        break
      case TransactionTypes.Exchange:
        if (this.props.session.realize_gains_on_exchange) {
          value = '≈ ' + formatMoney(txn.to.cost_basis, this.props.baseCurrency)
          info = 'This is your total cost for the new coins: Market price + fees'
        }
        break
      case TransactionTypes.Transfer:
        if (this.props.session.account_based_cost_basis) {
          value = '≈ ' + formatMoney(txn.to.cost_basis, this.props.baseCurrency)
          info = 'This is the value/cost-basis of the transferred coins'
        } else if (this.props.session.realize_transfer_fees && txn.fee_currency_id) {
          // transfers can only realize gains for fees
          value = formatMoney(txn.fee_value, this.props.baseCurrency) + ' fee value'
          info = 'This is the value of the transaction fee only. The cost-basis for the transferred amount remains unchanged'
        }
        break
    }

    return (
      <InfoItem
        heading={(!txn.from || txn.from.wallet.id !== txn.to.wallet.id) && txn.to.wallet.name} // dont show if from wallet is same as to
        title={`+ ${formatMoney(txn.to.amount, txn.to.currency)}`}
        icon={txn.to.currency.icon}
        costBasis={
          <Tooltip content={info} tag={'span'}>
            <span>{value}</span>
          </Tooltip>
        }
        gain={txn.label !== 'realized_gain' ? gain : '≈ ' + gain}
        gainColor={getDeltaColor(txn.gain)}
        strike={txn.ignored}
      />
    )
  }

  getTags(txn) {
    let tags = []

    if (txn.fee && math.pos(txn.fee.amount)) {
      let fee = formatMoney(txn.fee.amount, txn.fee.currency)
      let feeValue = formatMoney(txn.fee_value, this.props.session.base_currency)
      tags.push({ label: 'fee', color: 'badge-danger', info: fee + ' fee' + (feeValue !== fee ? ' = ' + feeValue : '') })
    }

    if (txn.manual) {
      tags.push({ label: 'M', color: 'badge-info', info: `This transaction was added manually` })
    }

    if (txn.description) {
      tags.push({ label: 'i', color: 'badge-secondary', info: txn.description })
    }

    return tags.map(data => (
      <Tooltip key={txn.id.toString() + '-' + data.label} content={data.info} tag="span">
        <span className={'badge badge-pill ml-1 ' + data.color}>{data.label}</span>
      </Tooltip>
    ))
  }

  renderMenu(txn) {
    if (txn.ignored) {
      return (
        <DropdownMenu>
          <DropdownItem onClick={this.unignore}>Restore</DropdownItem>
          <DropdownItem onClick={this.promptDelete}>Perm. delete</DropdownItem>
        </DropdownMenu>
      )
    } else {
      let labels = null
      if (txn.type === TransactionTypes.CryptoDeposit) {
        labels = DEPOSIT_LABELS
      } else if (txn.type === TransactionTypes.CryptoWithdrawal) {
        labels = WITHDRAW_LABELS
      } else if (txn.type === TransactionTypes.FiatWithdrawal) {
        labels = FIAT_WITHDRAW_LABELS
      } else if (txn.type === TransactionTypes.FiatDeposit) {
        labels = FIAT_DEPOSIT_LABELS
      }

      return (
        <DropdownMenu>
          {labels && labels.length > 0 && (
            <>
              {labels.map(
                tag =>
                  tag !== txn.label && (
                    <DropdownItem onClick={() => this.setLabel(tag)} key={tag} className={'small'}>
                      Tag as <b>{cleanLabel(tag)}</b>
                    </DropdownItem>
                  )
              )}
              <DropdownItem divider={true} />
            </>
          )}
          {labels && txn.label && <DropdownItem onClick={() => this.setLabel('')}>Remove tag</DropdownItem>}
          <DropdownItem tag={Link} to={{ pathname: `/transactions/${txn.id}/edit`, state: txn }}>
            Edit
          </DropdownItem>
          <DropdownItem onClick={this.promptDelete}>Delete</DropdownItem>
        </DropdownMenu>
      )
    }
  }

  render() {
    let txn = this.props.item

    let isBad = false
    switch (txn.type) {
      case TransactionTypes.Exchange:
      case TransactionTypes.Buy:
      case TransactionTypes.Sell:
        isBad = !txn.from || !txn.to
        break
      case TransactionTypes.Transfer:
        isBad = !txn.from || !txn.to
        break
      case TransactionTypes.CryptoDeposit:
      case TransactionTypes.FiatDeposit:
        isBad = !txn.to
        break
      case TransactionTypes.CryptoWithdrawal:
      case TransactionTypes.FiatWithdrawal:
        isBad = !txn.from
        break
    }

    // this can happen when a wallet has just been deleted and we are still
    // removing associated txns in sidekiq
    if (isBad) {
      return <div className="row well small text-muted">Deleting...</div>
    }

    let fromElement = this.getFromHtml()
    let toElement = this.getToHtml()
    const timeCompletedAtDate = moment(txn.date).parseZone()
    let icon = getTxnIcon(txn.type)

    return (
      <>
        <div
          className={`well pointer row ${txn.ignored ? 'deleted' : ''}`}
          onClick={() => this.setState({ showMoreInfo: !this.state.showMoreInfo })}
        >
          <div className="col-2 p-0">
            <div className="media align-items-center">
              <i className={`${icon.icon} mx-3`} style={{ fontSize: '1.5em', color: icon.color }} />
              <div className="media-body">
                <Tooltip content={this.props.item.date} tag="div">
                  <span className="text-muted small text-uppercase">{timeCompletedAtDate.format('LT')}</span>
                </Tooltip>
                {txn.ignored ? (
                  <div>
                    <del>{timeCompletedAtDate.format('ll')}</del> <span className="small text-danger">Deleted</span>
                  </div>
                ) : (
                  timeCompletedAtDate.format('ll')
                )}
              </div>
            </div>
          </div>
          <div className="col text-right">{fromElement}</div>
          <div className="col-1 text-center" style={{ fontSize: '1.5em', opacity: toElement ? '1' : '0' }}>
            <i className="fas fa-arrow-right text-muted" />
          </div>
          <div className="col">{toElement}</div>
          <div className="col-1 col-xl-2 p-0 text-right">
            {this.getTags(txn)}
            <UncontrolledDropdown className="d-inline-block" onClick={e => e.stopPropagation()}>
              <DropdownToggle nav>
                <i className="fas fa-ellipsis-v text-muted" />
              </DropdownToggle>
              {this.renderMenu(txn)}
            </UncontrolledDropdown>
          </div>
          <div className="col-12">
            {!txn.ignored && txn.negative_balances && (
              <NegativeBalanceInfo txn={txn} showMoreInfo={tab => this.setState({ showMoreInfo: true, moreInfoTab: tab })} />
            )}
            {!txn.ignored && txn.missing_rates && <MissingRatesInfo txn={txn} />}
            {/*{!txn.negative_balances && txn.missing_cost_basis && <MissingCostBasisInfo txn={txn}/>}*/}
          </div>
          {this.renderDeleteConfirm(txn)}
        </div>
        {!txn.ignored && (
          <SlideDown className={'transaction-slidedown'}>
            {this.state.showMoreInfo && validServerToken() && (
              <TxnSlidedown txn={txn} defaultTab={this.state.moreInfoTab} onDelete={this.promptDelete} />
            )}
          </SlideDown>
        )}
      </>
    )
  }
}

function mapStateToProps({ session }) {
  return {
    baseCurrency: session.base_currency,
    session,
  }
}

export default connect(mapStateToProps, { checkSyncStatus })(Transaction)
