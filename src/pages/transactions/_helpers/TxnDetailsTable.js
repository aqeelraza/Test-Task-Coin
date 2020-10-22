import ErrorIcon from '../../../components/ErrorIcon'
import WarningIcon from '../../../components/WarningIcon'
import ReactTable from 'react-table'
import { Colors, formatMoney } from '../../../common'
import { getWalletIcon } from '../../../common'
import NiceDecimal from '../../../components/NiceDecimal'
import Tooltip from '../../../components/Tooltip'
import { Link } from 'react-router-dom'
import React from 'react'
import moment from 'moment'

function reviewTxnHistoryLink(txn, account_id) {
  let date = moment(txn.date)
    .add(1, 'm')
    .toISOString()
  return `/transactions?account_id=${account_id}&to=${date}`
}

export default ({ txn, session }) => {
  let base = session.base_currency
  let items = []
  let isPNL = txn.label === 'realized_gain'

  let netWorthInfo = txn.missing_rates && (
    <ErrorIcon text={'No market rates found for this asset, assuming zero value. Edit the transaction to oveerride.'} />
  )
  if (!netWorthInfo && txn.net_worth) {
    netWorthInfo = <WarningIcon text="This market value was set manually or imported" />
  }

  if (txn.from) {
    items.push({
      name: isPNL ? 'Loss' : 'Sent',
      value: txn.net_value,
      sending: true,
      info: netWorthInfo,
      ...txn.from,
    })
  }

  if (txn.to) {
    items.push({
      name: isPNL ? 'Profit' : 'Received',
      value: txn.net_value,
      sending: false,
      info: netWorthInfo,
      ...txn.to,
    })
  }

  if (txn.fee) {
    items.push({
      name: 'Fee',
      value: txn.fee_value,
      sending: true,
      info: txn.fee_worth && <WarningIcon text="This market value was set manually or imported" />,
      ...txn.fee,
    })
  }

  return (
    <ReactTable
      data={items}
      columns={[
        {
          id: 'icon',
          width: 30,
          Cell: ({ original }) => (
            <i
              className={`fas ${original.sending ? 'fa-minus' : 'fa-plus'} p-1 small`}
              style={{ color: original.sending ? Colors.red : Colors.green }}
            />
          ),
        },
        {
          id: 'name',
          Header: '',
          accessor: 'name',
          headerClassName: 'text-left',
          className: 'text-left',
        },
        {
          id: 'amount',
          Header: `Amount`,
          headerClassName: 'text-left',
          className: 'text-left',
          Cell: ({ original }) => (
            <>
              <img src={original.currency.icon} width={25} className={'mr-2'} />
              <NiceDecimal number={original.amount} decimals={4} info={formatMoney(original.amount, original.currency)} />
              <span className="pl-2">{original.currency.symbol}</span>
            </>
          ),
        },
        {
          id: 'wallet',
          Header: `Wallet`,
          headerClassName: 'text-left',
          className: 'text-left',
          Cell: ({ original }) => (
            <>
              {getWalletIcon(original.wallet, 25)}
              {original.wallet.name}
            </>
          ),
        },
        {
          id: 'cost',
          Header: `Cost (${base.symbol})`,
          headerClassName: 'text-right',
          className: 'text-right',
          Cell: ({ original }) =>
            original.cost_basis ? <NiceDecimal number={original.cost_basis} decimals={2} info={formatMoney(original.value, base)} /> : null,
        },
        {
          id: 'value',
          Header: `Value (${base.symbol})`,
          headerClassName: 'text-right',
          className: 'text-right',
          Cell: ({ original }) => (
            <>
              <NiceDecimal number={original.value} decimals={2} info={formatMoney(original.value, base)} />
              {original.info}
            </>
          ),
        },
        {
          id: 'actions',
          Header: '',
          headerClassName: 'text-right',
          className: 'text-right',
          width: 40,
          Cell: ({ original }) => (
            <Tooltip content={`View prior ${original.currency.symbol} transactions`} tag="span">
              <Link to={reviewTxnHistoryLink(txn, original.account_id)}>
                <i className={`fas fa-eye p-1 text-muted`} />
              </Link>
            </Tooltip>
          ),
        },
      ]}
      className="-highlight txn-slidedown-details"
      showPagination={false}
      resizable={false}
      pageSize={items.length}
      getTheadTrProps={() => {
        return { className: 'text-muted small' }
      }}
      getTrProps={() => {
        return { className: 'py-1 border-top' }
      }}
      sortable={false}
    />
  )
}
