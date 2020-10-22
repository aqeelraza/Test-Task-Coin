import React from 'react'
import { withRouter } from 'react-router-dom'
import AppLayout from '../../layouts/AppLayout'
import Loader from '../../components/Loader'
import WalletForm from '../_helpers/WalletForm'
import axios from 'axios'
import queryString from 'query-string'
import { toastr } from 'react-redux-toastr'
import _ from 'lodash'
import connect from 'react-redux/es/connect/connect'
import { notifyError, notifyInfo } from '../../redux/reducers/notifier'
import { checkSyncStatus } from '../../redux/reducers/syncStatus'

class UpholdWalletCb extends WalletForm {
  componentDidMount() {
    let params = queryString.parse(this.props.location.search)
    axios
      .post('/api/oauth2/uphold_wallet', params)
      .then(res => this.onWalletAdded(res.data))
      .catch(error => this.onError(error))
  }

  onError(res) {
    toastr.error(_.get(res, 'response.data.errors[0].detail') || res.message)
    this.props.history.push('/wallets')
  }

  render() {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    )
  }
}

export default connect(null, { notifyError, notifyInfo, checkSyncStatus })(withRouter(UpholdWalletCb))
