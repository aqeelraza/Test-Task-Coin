import React from 'react'
import axios from 'axios'
import { Button } from '../../../controls'
import BigFormPage from '../../../components/BigFormPage'
import connect from 'react-redux/es/connect/connect'
import { notifyError, notifyInfo } from '../../../redux/reducers/notifier'
import { withRouter } from 'react-router-dom'
import { fetchEdgeTransactions } from '../../../common/edgeapp'
import _ from 'lodash'

class EdgeImportForm extends React.Component {
  onClick = () => {
    fetchEdgeTransactions()
      .then(txn_data => {
        let csv = [
          [
            'currencyCode',
            'nativeAmount',
            'networkFee',
            'parentNetworkFee',
            'blockHeight',
            'date',
            'txid',
            'metadata.name',
            'metadata.category',
            'metadata.amountFiat',
            'fiatCurrencyCode',
          ].join(','),
        ]
        txn_data.transactions.forEach(txn => {
          csv.push(
            [
              txn.currencyCode,
              txn.nativeAmount,
              txn.networkFee,
              txn.parentNetworkFee,
              txn.blockHeight,
              txn.date,
              txn.txid,
              _.get(txn, 'metadata.name'),
              _.get(txn, 'metadata.category'),
              _.get(txn, 'metadata.amountFiat'),
              txn_data.fiatCurrencyCode,
            ]
              .map(item => (item ? item.toString() : ''))
              .join(',')
          )
        })

        let blob = new Blob([csv.join('\n')], { type: 'text/csv' })
        let formData = new FormData()
        formData.append('csv_import[wallet_id]', this.props.wallet.id)
        formData.append('csv_import[file]', blob, 'edgeapp.csv')

        axios
          .post('/api/csv_imports', formData)
          .then(this.props.onSuccess)
          .catch(err => {
            console.log(err)
            this.props.notifyError('Import failed. Contact support for help!')
          })
      })
      .catch(err => {
        console.log(err)
        this.props.notifyError('We were unable to fetch your transactions from edge!')
      })
  }

  render() {
    let wallet = this.props.wallet
    return (
      <BigFormPage title="Import from Edge">
        <p>
          You will be prompted by {wallet.wallet_service.name} to grant <strong>read-only</strong> access to your transactions. This{' '}
          <strong>does not</strong> give us access to move your funds.
        </p>
        <div className="my-4">
          <Button color="primary" shouldFitContainer={true} onClick={this.onClick}>
            Continue to {wallet.wallet_service.name}
          </Button>
        </div>
      </BigFormPage>
    )
  }
}

export default connect(null, { notifyError, notifyInfo })(withRouter(EdgeImportForm))
