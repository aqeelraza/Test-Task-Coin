import { Colors, formatMoney, formatNumber, math } from '../../../common'
import { displayDate } from '../../../common'
import NiceDecimal from '../../../components/NiceDecimal'
import Blockies from 'react-blockies'
import Tooltip from '../../../components/Tooltip'
import { Link } from 'react-router-dom'
import moment from 'moment'
import ReactTable from 'react-table'
import React, { useState } from 'react'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import ReactJson from 'react-json-view'
import ReactDOM from 'react-dom'

class ExternalDataModal extends React.Component {
  constructor(props) {
    super(props)
    this.portalRoot = document.getElementById('portal')
    this.el = document.createElement('div')
  }

  componentDidMount = () => {
    this.portalRoot.appendChild(this.el)
  }

  componentWillUnmount = () => {
    this.portalRoot.removeChild(this.el)
  }

  render() {
    let modal = (
      <Modal isOpen={this.props.open} toggle={this.props.toggle}>
        <ModalHeader toggle={this.props.toggle}>
          Raw data {this.props.id}
          <div className="small text-muted">This is the data that was used to create this entry. It is sourced from API or CSV files.</div>
        </ModalHeader>
        <ModalBody>
          {this.props.data && <ReactJson src={this.props.data} enableClipboard={false} name={'external_data'} displayDataTypes={false} />}
        </ModalBody>
      </Modal>
    )

    return ReactDOM.createPortal(modal, this.el)
  }
}

function getHashForBlockies(original) {
  if (!original.transaction_id) {
    return '0'
  }
  // the blockies image is not unique enough with just a single txn id
  return (
    original.transaction_id.toString() +
    original.transaction_id.toString() +
    original.transaction_id.toString() +
    original.transaction_id.toString() +
    original.transaction_id.toString() +
    original.transaction_id.toString() +
    original.transaction_id.toString()
  )
}

export default ({ items }) => {
  const [showDebug, setShowDebug] = useState(null)
  return (
    <>
      <ReactTable
        data={items}
        columns={[
          {
            id: 'icon',
            width: 30,
            Cell: ({ original }) => (
              <i
                className={`fas ${math.neg(original.amount) ? 'fa-minus' : 'fa-plus'} p-1 small`}
                style={{ color: math.neg(original.amount) ? Colors.red : Colors.green }}
              />
            ),
          },
          {
            id: 'date',
            Header: 'Date',
            accessor: 'date',
            headerClassName: 'text-left',
            className: 'text-left small regular-line-height',
            width: 180,
            Cell: ({ original }) => displayDate(original.date),
          },
          {
            id: 'external_id',
            Header: 'Identifier',
            headerClassName: 'text-left',
            className: 'text-left justify-content-left d-flex align-items-center',
            width: 300,
            Cell: ({ original }) => (
              <>
                <Blockies size={4} scale={5} seed={getHashForBlockies(original)} className={'identicon'} />
                <span className="text-muted px-2">Tx #{original.transaction_id}</span>
                <span className="text-muted small">{original.external_id}</span>
              </>
            ),
          },
          {
            id: 'symbol',
            Header: `Account`,
            headerClassName: 'text-left',
            className: 'text-left',
            Cell: ({ original }) => (
              <>
                {original.currency.symbol}
                <span className="text-muted small pl-2">{original.wallet_name}</span>
              </>
            ),
          },
          {
            id: 'amount',
            Header: `Change`,
            headerClassName: 'text-left',
            className: 'text-left',
            Cell: ({ original }) => (
              <>
                {math.pos(original.amount) && '+'}
                <NiceDecimal number={original.amount} decimals={8} info={formatMoney(original.amount, original.currency)} />
              </>
            ),
          },
          {
            id: 'balance',
            Header: `Balance`,
            headerClassName: 'text-right',
            className: 'text-right',
            Cell: ({ original }) => (
              <>
                <NiceDecimal number={original.balance} decimals={8} info={formatNumber(original.balance)} />
                {original.negative && <span className="ml-2 text-danger">•</span>}
              </>
            ),
          },
          {
            id: 'actions',
            Header: '',
            headerClassName: 'text-right',
            className: 'text-right',
            width: 80,
            Cell: ({ original }) => (
              <>
                {original.external_data && (
                  <>
                    <Tooltip content={'View raw data'} tag="span">
                      <i className={`fas fa-bug p-1 mr-2 text-muted pointer`} onClick={() => setShowDebug(original)} />
                    </Tooltip>
                  </>
                )}
                <Tooltip content={'View prior entries'} tag="span">
                  <Link
                    to={{
                      pathname: `/entries/${original.account_id}`,
                      search: `to=${moment(original.date)
                        .add(1, 's')
                        .toISOString()}`,
                    }}
                  >
                    <i className={`fas fa-eye p-1 text-muted`} />
                  </Link>
                </Tooltip>
              </>
            ),
          },
        ]}
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
      {showDebug && (
        <ExternalDataModal
          open={!!showDebug}
          toggle={() => setShowDebug(null)}
          data={showDebug && showDebug.external_data}
          id={showDebug && showDebug.external_id}
        />
      )}
    </>
  )
}
