import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import CollectionPage from '../../components/CollectionPage'
import EmptyItem from '../../components/EmptyItem'
import Transaction from './_helpers/Transaction'
import { FormGroup, InputGroup } from 'reactstrap'
import CollectionSelect from '../../controls/CollectionSelect'
import _ from 'lodash'
import Blockies from 'react-blockies'
import { Colors } from '../../common'
import AppLayout from '../../layouts/AppLayout'
import { DEPOSIT_LABELS, LabelIconsMap, WITHDRAW_LABELS } from '../../Constants'
import { FilterSelect } from '../../controls/FilterSelect'
import { cleanLabel, getTxnIcon, localToUTC } from '../../common'
import moment from 'moment'
import DateRangePicker from 'rsuite/lib/DateRangePicker'

class TransactionsPage extends Component {
  state = {
    perPage: 10,
  }

  onClickReview = (e, setFilters) => {
    e.preventDefault()
    // need to remove lower date filter as negative balances from an old date can also affect newer ones
    setFilters({ review: true, from: null })
  }

  applyFilters = params => {
    let filters = []
    switch (params.type) {
      case 'crypto_deposit':
        filters.push('q[transaction_type_in][]=crypto_deposit')
        break
      case 'crypto_withdrawal':
        filters.push('q[transaction_type_in][]=crypto_withdrawal')
        break
      case 'buy':
        filters.push('q[transaction_type_in][]=buy')
        break
      case 'sell':
        filters.push('q[transaction_type_in][]=sell')
        break
      case 'exchange':
        filters.push('q[transaction_type_in][]=exchange')
        break
      case 'transfer':
        filters.push('q[transaction_type_in][]=transfer')
        break
      case 'deposit':
        filters.push('q[transaction_type_in][]=crypto_deposit')
        filters.push('q[transaction_type_in][]=fiat_deposit')
        break
      case 'withdrawal':
        filters.push('q[transaction_type_in][]=crypto_withdrawal')
        filters.push('q[transaction_type_in][]=fiat_withdrawal')
        break
      case 'trade':
        filters.push('q[transaction_type_in][]=exchange')
        filters.push('q[transaction_type_in][]=buy')
        filters.push('q[transaction_type_in][]=sell')
        break
    }

    if (params.negative_balances) {
      filters.push('q[negative_balances_true]=1')
    }

    if (params.missing_rates) {
      filters.push('q[missing_rates_true]=1')
    }

    if (params.label) {
      if (params.label === 'no_label') {
        filters.push('q[label_null]=1')
      } else {
        filters.push('q[label_eq]=' + params.label)
      }
    }

    if (params.manual) {
      filters.push('manual=1')
    }

    if (params.wallet_id) {
      filters.push(`q[from_wallet_id_or_to_wallet_id_eq]=${params.wallet_id}`)
    }

    if (params.account_id) {
      filters.push(`q[from_account_id_or_to_account_id_or_fee_account_id_eq]=${params.account_id}`)
    }

    if (params.currency_id) {
      filters.push(`q[from_currency_id_or_to_currency_id_or_fee_currency_id_eq]=${params.currency_id}`)
    }

    if (params.from) {
      filters.push(`q[date_gteq]=${params.from}`)
    }

    if (params.to) {
      filters.push(`q[date_lt]=${params.to}`)
    }

    if (params.order) {
      filters.push(`order=${params.order}`)
    }

    return filters
  }

  renderButtons = () => (
    <Fragment>
      <Link to="/transactions/new" className="btn btn-primary">
        <i className={'fas fa-plus pr-2 small'} />
        Add a transaction
      </Link>
    </Fragment>
  )

  renderFilters = (filters, setFilters, meta) => (
    <FormGroup className="row mb-4">
      <InputGroup style={{ alignItems: 'center' }}>
        <div className="col p-0">
          <CollectionSelect
            value={filters.wallet_id}
            placeholder={'All wallets'}
            url="/api/wallets"
            search={query => ({ 'q[name_cont]': query })}
            optionIcon={o => _.get(o, 'icon.small') || <Blockies size={6} scale={5} seed={o.icon_seed} />}
            onFormChange={(_, val) => setFilters({ wallet_id: val })}
            isClearable
          />
        </div>
        <div className="col ml-2 p-0">
          <CollectionSelect
            value={filters.currency_id}
            placeholder="All currencies"
            url={`/api/currencies`}
            search={query => ({ 'q[symbol_or_name_start]': query })}
            optionLabel={o => o.symbol}
            optionSubtext={o => o.name}
            optionIcon={o => o.icon}
            onFormChange={(_, val) => setFilters({ currency_id: val })}
            isClearable
          />
        </div>
      </InputGroup>
      <div className="col p-0">
        <FilterSelect
          title={'Type'}
          value={filters.type}
          onSelect={val => setFilters({ type: val })}
          items={[
            { id: 'crypto_deposit', name: 'Deposits' },
            { id: 'crypto_withdrawal', name: 'Withdrawals' },
            { id: 'trade', name: 'Trades' },
            { id: 'transfer', name: 'Transfers' },
            { id: 'deposit', name: 'All Deposits (incl. fiat)' },
            { id: 'withdrawal', name: 'All Withdrawals (incl. fiat)' },
          ].map(attrs => {
            return { ...attrs, ...getTxnIcon(attrs.id) }
          })}
          className="mr-2"
        />
        <FilterSelect
          title={'Label'}
          value={filters.label}
          onSelect={val => setFilters({ label: val })}
          items={_.uniq(DEPOSIT_LABELS.concat(WITHDRAW_LABELS).concat(['realized_gain', 'no_label'])).map(key => {
            return { id: key, name: cleanLabel(key), icon: LabelIconsMap[key], color: Colors.mutedIcon }
          })}
          className="mr-2"
        />
        <FilterSelect
          title={'Source'}
          value={filters.manual}
          onSelect={val => setFilters({ manual: val })}
          items={['manual']}
          className="mr-2"
        />
        <FilterSelect
          title={'Warnings'}
          selectPrefix={'Warning'}
          value={filters.negative_balances ? 'negative_balances' : filters.missing_rates ? 'missing_rates' : null}
          onSelect={val => setFilters({ negative_balances: val === 'negative_balances', missing_rates: val === 'missing_rates' })}
          items={[
            { id: 'negative_balances', name: 'Missing costs' },
            { id: 'missing_rates', name: 'Missing rates' },
          ]}
          className="mr-2"
        />
        <DateRangePicker
          placeholder={'Dates'}
          limitEndYear={5}
          onChange={dates =>
            setFilters(
              dates.length === 2
                ? {
                    from: localToUTC(dates[0]).toISOString(),
                    to: moment(localToUTC(dates[1]).toISOString())
                      .parseZone()
                      .endOf('day')
                      .toISOString(),
                  }
                : { from: null, to: null }
            )
          }
          value={_.remove(
            [
              filters.from
                ? moment(filters.from)
                    .parseZone()
                    .toDate()
                : null,
              filters.to
                ? moment(filters.to)
                    .parseZone()
                    .toDate()
                : null,
            ],
            null
          )}
          ranges={Array.from({ length: 5 }).map((_, idx) => {
            let year = new Date().getFullYear() - idx
            return {
              label: year,
              value: [new Date(year + '-01-01 00:00:00 UTC'), new Date(year + '-12-31 23:59:59 UTC')],
            }
          })}
          preventOverflow
        />
        {_.difference(Object.keys(filters), ['page', 'order', 'rel']).length > 0 && (
          <a href={'#'} className="small ml-3" onClick={() => setFilters(null)}>
            Clear filters
          </a>
        )}
        <div className="float-right">
          <FilterSelect
            value={filters.order || 'date'}
            selectTitle={selected => `Sort by ${selected.name}`}
            onSelect={val => setFilters({ order: val })}
            items={{ 'Most recent': 'date', 'Oldest first': 'date_reverse', 'Highest gains': 'gain' }}
            className="mr-2"
            noClear
          />
        </div>
      </div>
    </FormGroup>
  )

  render() {
    return (
      <AppLayout>
        <CollectionPage
          className="transactions-table well-list"
          title="TRANSACTIONS"
          url="/api/transactions"
          actions={this.renderButtons}
          filters={this.renderFilters}
          applyFilters={this.applyFilters}
          item={Transaction}
          perPage={this.state.perPage}
          empty={<EmptyItem text="No transactions here..." />}
          footer={<div className="row text-muted small mt-4">All date/times are in UTC</div>}
          showCount
        />
      </AppLayout>
    )
  }
}

export default TransactionsPage
