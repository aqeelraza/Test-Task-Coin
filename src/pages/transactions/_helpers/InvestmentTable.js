import _ from 'lodash'
import { Colors, formatMoney } from '../../../common'
import { displayDate } from '../../../common'
import NiceDecimal from '../../../components/NiceDecimal'
import moment from 'moment'
import Info from '../../../components/Info'
import ReactTable from 'react-table'
import React from 'react'
import { AVERAGE_COST_METHODS } from '../../../Constants'

export default ({ items, session }) => {
  let base = session.base_currency
  let averageCostMethod = AVERAGE_COST_METHODS.includes(session.cost_basis_method)
  return (
    <ReactTable
      data={items}
      columns={_.remove(
        [
          {
            id: 'icon',
            width: 30,
            Cell: ({ original }) => (
              <i
                className={`fas ${original.withdrawal ? 'fa-minus' : 'fa-plus'} p-1 small`}
                style={{ color: original.withdrawal ? Colors.red : Colors.green }}
              />
            ),
          },
          !averageCostMethod
            ? {
                id: 'acquisition_date',
                Header: 'Acquired on',
                accessor: 'from_date',
                headerClassName: 'text-left',
                className: 'text-left small regular-line-height',
                Cell: ({ original }) => {
                  if (original.withdrawal) {
                    if (original.from_date) {
                      return displayDate(original.from_date)
                    } else {
                      return 'N/a'
                    }
                  } else {
                    return displayDate(original.date)
                  }
                },
              }
            : null,
          {
            id: 'info',
            Header: 'Info',
            accessor: 'info',
            headerClassName: 'text-left',
            className: 'text-left small regular-line-height',
            style: { overflow: 'visible', whiteSpace: 'normal' },
            width: 225,
          },
          !averageCostMethod
            ? {
                id: 'holding_period',
                Header: `Holding period`,
                headerClassName: 'text-left',
                className: 'text-left small regular-line-height',
                Cell: ({ original }) => {
                  let display = 'N/a'
                  if (original.from_date) {
                    let diffInDays = moment(original.date).diff(moment(original.from_date), 'days')
                    let suffix = diffInDays !== 1 ? ' days' : ' day'
                    let shortLong = session.country.has_long_term ? (original.long_term ? ' (Long)' : ' (Short)') : ''
                    display = diffInDays + suffix + shortLong
                  }
                  return display
                },
              }
            : null,
          {
            id: 'amount',
            Header: `Amount`,
            headerClassName: 'text-left',
            className: 'text-left',
            Cell: ({ original }) => (
              <>
                <NiceDecimal number={original.amount} decimals={4} info={formatMoney(original.amount, original.currency)} />
                <span className="pl-2">{original.currency.symbol}</span>
              </>
            ),
          },
          {
            id: 'value',
            Header: `Cost (${base.symbol})`,
            headerClassName: 'text-left',
            className: 'text-left',
            Cell: ({ original }) => <NiceDecimal number={original.value} decimals={2} info={formatMoney(original.value, base)} />,
          },
          {
            id: 'gain',
            Header: `Gain (${base.symbol})`,
            headerClassName: 'text-right',
            className: 'text-right',
            Cell: ({ original }) => <NiceDecimal number={original.gain} decimals={2} info={formatMoney(original.gain, base)} colored />,
          },
          {
            id: 'notes',
            Header: '',
            accessor: 'notes',
            headerClassName: 'text-right',
            className: 'text-right',
            width: 40,
            Cell: ({ original }) =>
              original.notes && original.notes.length > 0 && original.notes !== original.info && <Info text={original.notes} />,
          },
        ],
        null
      )}
      className="-highlight"
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
