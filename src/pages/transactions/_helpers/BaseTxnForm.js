import React, { Component, Fragment } from 'react'
import _ from 'lodash'
import { Badge, FormGroup, InputGroup, InputGroupAddon } from 'reactstrap'
import moment from 'moment'
import { BuilderTransactionTypes, TransactionTypes } from '../../../Constants'
import CollectionSelect from '../../../controls/CollectionSelect'
import { Button, DateTimeInput, Label, TextAreaInput, TextInput, NumberInput, HiddenInput } from '../../../controls'
import { formatMoney } from '../../../common'
import Info from '../../../components/Info'
import WarningIcon from '../../../components/WarningIcon'
import { getWalletIcon, cleanLabel } from '../../../common'
import Tooltip from '../../../components/Tooltip'
import * as math from '../../../common/math'

export function groupByCurrencyType(options) {
  return [
    { label: 'Fiat', options: options.filter(opt => opt.fiat) },
    { label: 'Crypto', options: options.filter(opt => !opt.fiat) },
  ]
}

export const renderCurrencyAndAmount = (title, amount, currency, misc = null) => (
  <FormGroup>
    {title && (
      <Label>
        {title}
        {misc && misc.help && <Info text={misc.help} />}
      </Label>
    )}
    <InputGroup>
      <InputGroupAddon addonType="prepend" style={{ width: '130px' }}>
        <CollectionSelect
          value={_.get(currency, 'selectedOption.id')}
          url={`/api/currencies${_.get(misc, 'fiatOnly') ? '?q[fiat_true]=1' : ''}`}
          search={query => ({ 'q[symbol_or_name_start]': query })}
          optionLabel={o => o.symbol}
          optionSubtext={o => o.name}
          optionIcon={o => o.icon}
          groupOptions={groupByCurrencyType}
          placeholder={'Coin...'}
          fullSizeDropdown
          errorTooltip
          noGroup
          required={_.get(misc, 'optional') !== true}
          {...currency}
        />
      </InputGroupAddon>
      <NumberInput noGroup placeholder={'Amount...'} required={_.get(misc, 'optional') !== true} {...amount} />
    </InputGroup>
    {!title && misc && misc.help && (
      <small className="text-muted" style={{ fontStyle: 'italic' }}>
        {misc.help}
      </small>
    )}
  </FormGroup>
)

export const renderWallet = (title, opt = {}) => (
  <CollectionSelect
    title={title || opt.title}
    value={_.get(opt, 'selectedOption.id')}
    url="/api/wallets"
    search={query => ({ 'q[name_cont]': query })}
    optionIcon={o => getWalletIcon(o, 30)}
    optionSubtext={o => (o.api_connected ? 'SYNCED' : null)}
    placeholder={'Select wallet...'}
    required
    {...opt}
  />
)

const OpenBtn = props => (
  <Button color="subtle" onClick={props.onClick}>
    {props.title}
  </Button>
)

export default class BaseTxnForm extends Component {
  state = {
    txn: null,
    parsedDate: moment()
      .utc()
      .format('YYYY-MM-DD HH:mm:ss Z'),
    feeOpen: false,
    netValueOpen: false,
    feeValueOpen: false,
    descriptionOpen: false,
    txhashOpen: false,
    netWorthCurrency: this.props.session.base_currency,
    feeWorthCurrency: this.props.session.base_currency,
  }

  onTxnLoaded = txn => {
    let type = ''
    switch (txn.type) {
      case TransactionTypes.CryptoDeposit:
      case TransactionTypes.FiatDeposit:
        type = BuilderTransactionTypes.Deposit
        break
      case TransactionTypes.CryptoWithdrawal:
      case TransactionTypes.FiatWithdrawal:
        type = BuilderTransactionTypes.Withdrawal
        break
      case TransactionTypes.Transfer:
        type = BuilderTransactionTypes.Transfer
        break
      default:
        type = BuilderTransactionTypes.Trade
    }

    this.setState({
      txn,
      label: _.get(txn, 'label'),
      parsedDate: moment(txn.date)
        .utc()
        .format('YYYY-MM-DD HH:mm:ss Z'),
      feeOpen: _.get(txn, 'fee.amount') > 0,
      descriptionOpen: txn.description && txn.description !== '',
      txhashOpen: txn.txhash && txn.txhash !== '',
      fromWallet: _.get(txn, 'from.wallet'),
      toWallet: _.get(txn, 'to.wallet'),
      fromCurrency: _.get(txn, 'from.currency'),
      toCurrency: _.get(txn, 'to.currency'),
      feeCurrency: _.get(txn, 'fee.currency'),
      netWorthCurrency: _.get(txn, 'net_worth.currency') || this.props.session.base_currency,
      feeWorthCurrency: _.get(txn, 'fee_worth.currency') || this.props.session.base_currency,
      type,
    })
  }

  txnField = field => {
    if (this.state.txn) {
      return _.get(this.state.txn, field)
    }
    return undefined
  }

  renderNetValueAmount = (title, opt = { amount: {}, currency: {} }) =>
    renderCurrencyAndAmount(
      title,
      {
        name: 'net_worth_amount',
        value: this.txnField('net_worth.amount') || this.txnField('net_value'),
        ...opt.amount,
      },
      {
        name: 'net_worth_currency_id',
        selectedOption: this.state.netWorthCurrency,
        onChange: selected => this.setState({ netWorthCurrency: selected }),
        ...opt.currency,
      },
      {
        fiatOnly: true,
        optional: true,
        help: 'Total value of this transaction in a fiat currency. Leave blank to use market value',
      }
    )

  renderNetValue = () => {
    const canShowNetValue =
      _.get(this.state.fromCurrency, 'id') !== this.props.session.base_currency.id &&
      _.get(this.state.toCurrency, 'id') !== this.props.session.base_currency.id
    const initialValue = this.txnField('net_value') && formatMoney(this.txnField('net_value'), this.props.session.base_currency)

    const onClick = e => {
      e.preventDefault()
      this.setState({ netValueOpen: true })
    }

    const addNegativeMargin = initialValue || (canShowNetValue && !this.state.netValueOpen)
    return (
      <Fragment>
        <div className="text-right small" style={addNegativeMargin ? { marginTop: '-0.75rem' } : null}>
          {initialValue && (
            <span className="pr-2 text-muted">
              worth {initialValue}
              {this.txnField('net_worth') && <WarningIcon text="This price was set manually" />}
            </span>
          )}
          {canShowNetValue && !this.state.netValueOpen && (
            <a href="#" onClick={onClick}>
              {initialValue ? 'change' : 'Set worth'}
            </a>
          )}
        </div>
        {canShowNetValue && this.state.netValueOpen && this.renderNetValueAmount('Net Worth')}
      </Fragment>
    )
  }

  renderFeeAmount = (title, opt = { amount: {}, currency: {}, misc: {} }) =>
    renderCurrencyAndAmount(
      title,
      {
        name: 'fee_amount',
        value: this.txnField('fee.amount'),
        isDisabled: this.txnField('synced'),
        ...opt.amount,
      },
      {
        name: 'fee_currency_id',
        selectedOption: this.state.feeCurrency,
        isDisabled: this.txnField('synced'),
        onChange: selected => this.setState({ feeCurrency: selected }),
        ...opt.currency,
      },
      { optional: true, ...opt.misc }
    )

  renderFeeValueAmount = (title, opt = { amount: {}, currency: {} }) =>
    renderCurrencyAndAmount(
      'Fee value',
      {
        name: 'fee_worth_amount',
        value: this.txnField('fee_worth.amount') || this.txnField('fee_value'),
        ...opt.amount,
      },
      {
        name: 'fee_worth_currency_id',
        selectedOption: this.state.feeWorthCurrency,
        onChange: selected => this.setState({ feeWorthCurrency: selected }),
        ...opt.currency,
      },
      {
        fiatOnly: true,
        optional: true,
        help: 'Total value of the fee amount of this txn. Leave blank to use market value',
      }
    )

  renderFeeValue = () => {
    const canShowFeeValue =
      this.state.feeCurrency &&
      !this.state.feeCurrency.fiat &&
      this.state.feeCurrency.id !== _.get(this.state.fromCurrency, 'id') &&
      this.state.feeCurrency.id !== _.get(this.state.toCurrency, 'id')

    const initialValue = this.txnField('fee_value') && formatMoney(this.txnField('fee_value'), this.props.session.base_currency)

    const onClick = e => {
      e.preventDefault()
      this.setState({ feeValueOpen: true })
    }

    const addNegativeMargin = initialValue || (canShowFeeValue && !this.state.feeValueOpen)
    return (
      <Fragment>
        <div className="text-right small" style={addNegativeMargin ? { marginTop: '-0.75rem' } : null}>
          {initialValue && (
            <span className="pr-2 text-muted">
              worth {initialValue}
              {this.txnField('fee_worth') && <WarningIcon text="This price was set manually" />}
            </span>
          )}
          {canShowFeeValue && !this.state.feeValueOpen && (
            <a href="#" onClick={onClick}>
              {initialValue ? 'change' : 'Set worth'}
            </a>
          )}
        </div>
        {canShowFeeValue && this.state.feeValueOpen && this.renderFeeValueAmount('Fee worth')}
      </Fragment>
    )
  }

  renderFee = (title, opt = { amount: {}, currency: {} }) => {
    if (!this.state.feeAmountOpen && !this.state.feeCurrency) {
      const onClick = e => {
        e.preventDefault()
        this.setState({ feeAmountOpen: true })
      }

      if (this.txnField('from.source') === 'api') {
        return null
      }

      return (
        <a href="#" onClick={onClick}>
          + fee
        </a>
      )
    }

    return (
      <Fragment>
        {this.renderFeeAmount(title, opt)}
        {this.renderFeeValue()}
      </Fragment>
    )
  }

  getTags(type) {
    if (type === BuilderTransactionTypes.Withdrawal && (!this.state.fromCurrency || this.state.fromCurrency.fiat === false)) {
      return [
        {
          id: null,
          name: 'Payment',
          desc: 'Paid for goods or sold crypto through third party',
        },
        {
          name: 'Transfer',
          desc: 'Transferred coins to own wallet',
          onSelect: () =>
            this.setState({
              type: BuilderTransactionTypes.Transfer,
              initialToAmount: this.state.fromAmount || this.txnField('from.amount'),
              initialToCurrency: this.state.fromCurrency || this.txnField('from.currency'),
            }),
        },
        {
          id: 'lost',
          name: 'Lost access / Stolen',
          desc: 'No longer have access to these coins',
        },
        {
          name: 'Trade',
          desc: 'Received other coins in return for these',
          onSelect: () =>
            this.setState({
              type: BuilderTransactionTypes.Trade,
              initialToAmount: null,
              initialToCurrency: null,
            }),
          hide: true,
        },
        {
          id: 'gift',
          name: 'Gift / Donation',
          desc: 'This transaction is exempt from taxes',
          subtypes: ['gift', 'donation'],
          hide: true,
        },
        {
          id: 'cost',
          name: 'Cost',
          desc: 'This is a tax deductible fee or cost',
          subtypes: ['cost', 'margin_interest_fee', 'margin_trade_fee'],
          hide: true,
        },
        {
          id: 'realized_gain',
          name: 'Realized Loss',
          desc: 'Realized loss from a futures trade (short/long)',
          hide: true,
        },
      ]
    } else if (type === BuilderTransactionTypes.Withdrawal && this.state.fromCurrency.fiat === true) {
      return [
        {
          id: null,
          name: 'Bank',
          desc: 'Withdrew funds to bank account',
        },
        {
          id: 'cost',
          name: 'Cost',
          desc: 'This is a tax deductible fee or cost',
          subtypes: ['cost', 'margin_interest_fee', 'margin_trade_fee'],
          hide: true,
        },
        {
          name: 'Trade',
          desc: 'Purchased some crypto with this',
          onSelect: () =>
            this.setState({
              type: BuilderTransactionTypes.Trade,
              initialToAmount: null,
              initialToCurrency: null,
            }),
          hide: true,
        },
        {
          id: 'realized_gain',
          name: 'Realized Loss',
          desc: 'Realized loss from a futures trade (short/long)',
          hide: true,
        },
      ]
    } else if (type === BuilderTransactionTypes.Deposit && (!this.state.toCurrency || this.state.toCurrency.fiat === false)) {
      return [
        {
          id: null,
          name: 'Purchase',
          desc: 'Purchased or received these coins from a third party',
        },
        {
          name: 'Transfer',
          desc: 'Transferred coins from own wallet',
          onSelect: () =>
            this.setState({
              type: BuilderTransactionTypes.Transfer,
              initialFromAmount: this.state.toAmount || this.txnField('to.amount'),
              initialFromCurrency: this.state.toCurrency,
            }),
        },
        {
          id: 'other_income',
          name: 'Income',
          desc: 'Received coins from Mining, Forks, DeFi etc',
          subtypes: ['airdrop', 'fork', 'mining', 'staking', 'loan_interest', 'other_income'],
        },
        {
          name: 'Trade',
          desc: 'Exchanged some other coins for these',
          onSelect: () =>
            this.setState({
              type: BuilderTransactionTypes.Trade,
              initialFromAmount: null,
              initialFromCurrency: null,
            }),
          hide: true,
        },
        {
          id: 'realized_gain',
          name: 'Realized Profit',
          desc: 'Realized profit from a futures trade (short/long)',
          hide: true,
        },
      ]
    } else if (type === BuilderTransactionTypes.Deposit && this.state.toCurrency.fiat === true) {
      return [
        {
          id: null,
          name: 'Bank',
          desc: 'Deposited funds from a bank account',
        },
        {
          id: 'other_income',
          name: 'Income',
          desc: 'Received fiat income from Mining, DeFi etc',
          subtypes: ['loan_interest', 'other_income'],
        },
        {
          name: 'Trade',
          desc: 'Sold some crypto for this',
          onSelect: () =>
            this.setState({
              type: BuilderTransactionTypes.Trade,
              initialFromAmount: null,
              initialFromCurrency: null,
            }),
          hide: true,
        },
        {
          id: 'realized_gain',
          name: 'Realized Profit',
          desc: 'Realized profit from a futures trade (short/long)',
          hide: true,
        },
      ]
    }
  }

  renderTag(tag, selected) {
    return (
      <div
        className={`mb-2 txn-label-button ${selected ? 'active' : ''}`}
        onClick={() => (tag.onSelect ? tag.onSelect() : this.setState({ label: tag.id }))}
      >
        <h4 style={{ fontSize: '1.25rem' }}>{tag.name}</h4>
        <div className="small text-muted">{tag.desc}</div>
        {tag.subtypes && selected && (
          <div className={'pt-2'}>
            {tag.subtypes.map(item => (
              <Badge
                key={item}
                className="pill"
                color={item === this.state.label ? 'primary' : 'light'}
                onClick={e => {
                  e.stopPropagation()
                  this.setState({ label: item })
                }}
              >
                {cleanLabel(item)}
              </Badge>
            ))}
          </div>
        )}
      </div>
    )
  }

  renderTags(type) {
    let tags = this.getTags(type)
    let selectedTag = this.state.label
      ? tags.find(tag => tag.id === this.state.label || (tag.subtypes && tag.subtypes.includes(this.state.label)))
      : tags[0]
    if (!selectedTag) {
      // user changed from crypto to fiat but had a crypto-only tag selected
      selectedTag = tags[0]
      this.setState({ label: tags[0].id })
    }
    tags = tags.filter(tag => tag !== selectedTag)

    let hiddenTags = tags.filter(tag => tag.hide)
    let visibleTags = tags.filter(tag => !tag.hide)

    let showMoreOptions = e => {
      e.preventDefault()
      this.setState({ showAllTags: !this.state.showAllTags })
    }

    return (
      <>
        {selectedTag && this.renderTag(selectedTag, true)}
        {visibleTags.map(tag => this.renderTag(tag))}
        {this.state.showAllTags && hiddenTags.map(tag => this.renderTag(tag))}
        {hiddenTags.length > 0 && (
          <div className="text-right" style={{ marginTop: '-0.5em' }}>
            <a href="#" className="small" onClick={e => showMoreOptions(e)}>
              {this.state.showAllTags ? 'Hide options' : 'Show all options'}
            </a>
          </div>
        )}
      </>
    )
  }

  renderWalletAmountForm(title, source, options) {
    let importSource = null
    if (source === 'api') {
      importSource = { title: 'Read only', info: 'This transaction was synced by an API and cant be modified', color: 'badge-info' }
    }

    const deletePart = e => {
      e.preventDefault()
      options.onDelete()
    }

    return (
      <>
        <h4 className="text-center">{title}</h4>
        <div className="txn-part-wrapper">
          <DateTimeInput title="Date (UTC)" name="date" value={this.state.parsedDate} disabled={this.txnField('synced')} />
          {renderWallet(null, options.wallet)}
          {renderCurrencyAndAmount(null, options.amount, options.currency, options.misc)}
          {options.showNetValue ? this.renderNetValue() : null}
          {options.showFee ? this.renderFee('Fee') : null}
          {options.bottom}
        </div>
        <div className="small pt-1">
          {importSource && (
            <Tooltip content={importSource.info} tag={'span'}>
              <span className={'ml-1 small badge ' + importSource.color} style={{ fontSize: '12px' }}>
                {importSource.title}
              </span>
            </Tooltip>
          )}
          {options.showDelete ? (
            <a href="#" className="text-danger float-right" onClick={e => deletePart(e)}>
              Delete
            </a>
          ) : null}
        </div>
      </>
    )
  }

  renderLeftSide(type) {
    if (
      type === BuilderTransactionTypes.Transfer ||
      type === BuilderTransactionTypes.Trade ||
      type === BuilderTransactionTypes.Withdrawal
    ) {
      // state.initialFromAmount is set when we switch a deposit to a transfer, so we can copy the deposit amount here
      // if its not set we will use any existing from amount from the txn
      let initialFromAmount = this.state.initialFromAmount || this.txnField('from.amount')

      // server expects fromAmount to include the fee for transfers
      if (this.txnField('type') === TransactionTypes.Transfer && this.txnField('fee.amount')) {
        initialFromAmount = math.add(initialFromAmount, this.txnField('fee.amount'))
      }

      // for transfers: calculate fee difference between from and to
      let fee = null
      let fromAmount = this.state.fromAmount || initialFromAmount
      let toAmount = this.state.toAmount || this.state.initialToAmount || this.txnField('to.amount')
      let fromCurrency = this.state.fromCurrency || this.txnField('to.currency')
      if (type === BuilderTransactionTypes.Transfer && fromAmount && toAmount && fromCurrency) {
        let calculated = fromAmount - toAmount
        if (calculated > 0) {
          fee = (
            <div className="text-right" style={{ marginTop: '-1em' }}>
              <span className="small">
                fee: {Number(calculated.toFixed(8))} {fromCurrency.symbol}
              </span>
            </div>
          )
        }
      }

      let disabled = this.txnField('from.source') === 'api'
      return this.renderWalletAmountForm(type === BuilderTransactionTypes.Trade ? 'Sold / Sent' : 'Sent', this.txnField('from.source'), {
        wallet: {
          title: 'From',
          selectedOption: this.txnField('from.wallet') || (type !== BuilderTransactionTypes.Transfer && this.txnField('to.wallet')),
          name: 'from_wallet_id',
          onChange: fromWallet => this.setState({ fromWallet }),
          isDisabled: disabled,
        },
        amount: {
          value: initialFromAmount,
          name: 'from_amount',
          onChange: (_, fromAmount) => this.setState({ fromAmount }),
          isDisabled: disabled,
        },
        currency: {
          selectedOption: this.state.initialFromCurrency || this.txnField('from.currency'),
          name: 'from_currency_id',
          onChange: fromCurrency => this.setState({ fromCurrency }),
          isDisabled: disabled,
        },
        showFee: type === BuilderTransactionTypes.Trade,
        showNetValue: type === BuilderTransactionTypes.Withdrawal,
        showDelete: !disabled && type !== BuilderTransactionTypes.Withdrawal,
        bottom: fee,
        onDelete: () =>
          this.setState({
            type: BuilderTransactionTypes.Deposit,
            label: null,
            fromAmount: null,
            fromCurrency: null,
            fromWallet: null,
            feeAmount: null,
            feeCurrency: null,
            initialFromAmount: null,
            initialFromCurrency: null,
          }),
      })
    }

    return this.renderTags(type)
  }

  renderRightSide(type) {
    if (type === BuilderTransactionTypes.Transfer || type === BuilderTransactionTypes.Trade || type === BuilderTransactionTypes.Deposit) {
      let disabled = this.txnField('to.source') === 'api'
      return this.renderWalletAmountForm(
        type === BuilderTransactionTypes.Trade ? 'Bought / Received' : 'Received',
        this.txnField('to.source'),
        {
          wallet: {
            title: 'To',
            selectedOption: this.txnField('to.wallet') || (type !== BuilderTransactionTypes.Transfer && this.txnField('from.wallet')),
            name: 'to_wallet_id',
            isDisabled: disabled,
          },
          amount: {
            value: this.state.initialToAmount || this.txnField('to.amount'),
            name: 'to_amount',
            onChange: (_, toAmount) => this.setState({ toAmount }),
            isDisabled: disabled,
          },
          currency: {
            selectedOption: (type === BuilderTransactionTypes.Transfer && this.state.fromCurrency) || this.txnField('to.currency'),
            name: 'to_currency_id',
            onChange: toCurrency => this.setState({ toCurrency }),
            isDisabled: disabled || type === BuilderTransactionTypes.Transfer,
            shallowDisable: type === BuilderTransactionTypes.Transfer,
          },
          showNetValue: true,
          showDelete: this.txnField('to.source') !== 'api' && type !== BuilderTransactionTypes.Deposit,
          onDelete: () =>
            this.setState({
              type: BuilderTransactionTypes.Withdrawal,
              label: null,
              toAmount: null,
              toCurrency: null,
              toWallet: null,
              feeAmount: null,
              feeCurrency: null,
              initialToAmount: null,
              initialToCurrency: null,
            }),
        }
      )
    }

    return this.renderTags(type)
  }

  renderFormFields() {
    let type = this.state.type
    return (
      <>
        <HiddenInput name="type" value={type} />
        <HiddenInput name="label" value={this.state.label} />
        <div className="row d-flex align-items-center mb-4">
          <div className="col-4 offset-1">{this.renderLeftSide(type)}</div>
          <div className="col-2 text-center" style={{ padding: '0', marginTop: '10px', fontSize: '20px' }}>
            <span className="fa-stack fa-2x text-muted" style={{ fontSize: '1.5em' }}>
              <i className="fas fa-stack-1x fa-arrow-right" />
            </span>
          </div>
          <div className="col-4">{this.renderRightSide(type)}</div>
        </div>
        <div className="row">
          <div className="col-10 offset-1">
            {this.state.descriptionOpen && (
              <TextAreaInput
                placeholder="Ex. sent some crypto to mom"
                title={'Description'}
                name="description"
                value={this.txnField('description') || ''}
                style={{ paddingBottom: '1rem' }}
              />
            )}
            {this.state.txhashOpen && (
              <TextInput title={'Transaction Hash'} name="txhash" value={this.txnField('txhash') || ''} style={{ paddingBottom: '1rem' }} />
            )}
            <div className="pt-4 pb-3 text-center">
              <InputGroup className="justify-content-center">
                {!this.state.descriptionOpen && <OpenBtn title="+ Description" onClick={() => this.setState({ descriptionOpen: true })} />}
                {!this.state.txhashOpen && <OpenBtn title="+ TxHash" onClick={() => this.setState({ txhashOpen: true })} />}
              </InputGroup>
            </div>
          </div>
        </div>
      </>
    )
  }
}
