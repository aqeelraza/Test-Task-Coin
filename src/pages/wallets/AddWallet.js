import React from 'react'
import { TextInput, HiddenInput } from '../../controls'
import { withRouter, Link } from 'react-router-dom'
import AppLayout from '../../layouts/AppLayout'
import connect from 'react-redux/es/connect/connect'
import { notifyError, notifyInfo } from '../../redux/reducers/notifier'
import { checkSyncStatus } from '../../redux/reducers/syncStatus'
import PageLoader from '../../components/PageLoader'
import queryString from 'query-string'
import CenteredFormPage from '../../components/CenteredFormPage'
import { getWalletIcon } from '../../common'
import ReactGA from 'react-ga'
import { usingEdgeApp } from '../../common/edgeapp'
import ConfirmDialog from '../../components/ConfirmDialog'
import ButtonItem from './_helpers/ButtonItem'

class AddWallet extends React.Component {
  state = {}

  onWalletAdded = wallet => {
    this.props.notifyInfo(`Added ${wallet.name}`)
    window.Intercom('trackEvent', 'wallet-added', { name: wallet.name })
    ReactGA.event({ category: 'user', action: 'wallet-added' })

    if (this.state.submitSource === 'api') {
      this.props.history.replace(`/wallets/${wallet.id}/api`, wallet)
    } else if (this.state.submitSource === 'csv') {
      this.props.history.replace(`/wallets/${wallet.id}/upload`, wallet)
    } else {
      this.props.history.goBack()
    }
  }

  onClickMultiassetWallet = svc => {
    this.props.history.push(`/wallets/multiasset`, svc)
  }

  onClickAction = (service, action) => {
    switch (action) {
      case 'auto-sync':
        if (service && service.api_active) {
          this.setState({ submitSource: 'api' })
        } else {
          this.onClickMultiassetWallet(service)
          return
        }
        break
      case 'csv':
        this.setState({ submitSource: 'csv' })
        break
      case 'manual':
        this.setState({ submitSource: null })
        break
      default:
        console.log('unknown action')
    }
    this.formRef.dispatchEvent(new Event('submit', { cancelable: true }))
  }

  withWarning = (e, service, action) => {
    if (e) e.preventDefault() // prevents form from submitting
    if (service && service.existing_count && service.existing_count > 0) {
      this.setState({ confirmAction: true, action: action })
    } else {
      this.onClickAction(service, action)
    }
  }

  renderContent() {
    let service = this.props.location.state || this.state.walletService
    if (!service && this.props.match.params.id) {
      // we wont have existing_count when calling this endpoint
      return (
        <PageLoader url={`/api/wallet_services/${this.props.match.params.id}`} onLoad={walletService => this.setState({ walletService })} />
      )
    }

    let name = service ? service.name : queryString.parse(this.props.location.search).name
    let existingCount = service && service.existing_count ? service.existing_count : 0
    if (existingCount > 0) {
      name += ' ' + (existingCount + 1)
    }

    return (
      <CenteredFormPage
        showBack
        title={'Adding a new wallet'}
        post={{ url: '/api/wallets', root: 'wallet' }}
        readOnlyText={
          service &&
          existingCount > 0 && (
            <div className="div alert alert-warning text-left" style={{ fontSize: '16px' }}>
              You already have {existingCount} {service.name} wallets. If you want to import into an existing wallet go to the Wallets page.{' '}
              <Link to="/wallets" className={'ml-3'}>
                <b>Take me there</b>
              </Link>
            </div>
          )
        }
        submitButton={() => null}
        formRef={form => (this.formRef = form)}
        onSuccess={this.onWalletAdded}
      >
        <div className="text-center mb-4">{getWalletIcon({ ...service, name: this.state.name || '' }, 100)}</div>

        <TextInput title="Wallet Name" name="name" value={name} onChange={(_, name) => this.setState({ name })} required />

        {service && <HiddenInput name={'wallet_service_id'} value={service.id} />}

        <h5 className="mt-4 pt-4">Let's import some data...</h5>
        {service && (service.api_active || (service.type === 'wallet' && service.tag !== 'edge_app')) && (
          <ButtonItem
            title={'Setup auto-sync'}
            subtitle={'Let Koinly import your transactions automatically'}
            icon={'fa-sync-alt'}
            onClick={e => this.withWarning(e, service, 'auto-sync')}
            badgeText={service.api_beta ? 'beta' : 'recommended'}
            badgeColor={service.api_beta ? 'danger' : 'success'}
          />
        )}
        {service && service.tag === 'edge_app' && usingEdgeApp() && (
          <ButtonItem
            title={'Import from Edge'}
            subtitle={'Let Koinly import your transactions automatically'}
            icon={'fa-sync-alt'}
            onClick={e => this.withWarning(e, service, 'csv')}
            badgeText={'recommended'}
            badgeColor={'success'}
          />
        )}
        {(!service || !(service.tag === 'coinbase' || service.tag === 'gdax' || service.type === 'blockchain') || !service.api_active) && (
          <ButtonItem
            title={'Upload CSV files'}
            subtitle={'Download your transaction history and upload it here'}
            icon={'fa-file-upload'}
            onClick={e => this.withWarning(e, service, 'csv')}
            hideTopBorder
          />
        )}
        <div className="text-muted text-right mt-2">
          <button
            className="pointer btn btn-link text-muted p-0"
            style={{ borderBottom: '1px dotted #a0a0a0' }}
            onClick={e => this.withWarning(e, service, 'manual')}
            type="submit"
          >
            Create without data
          </button>
        </div>

        {service && existingCount > 0 && (
          <ConfirmDialog
            text={
              <div>
                You are about to create a new {name} wallet. You already have {existingCount} existing wallets, are you sure you want to
                create a new one instead of importing into an existing one?
                <p className="small py-2 mt-2 alert alert-info">
                  To import data into an existing wallet go to the <Link to={'/wallets'}>Wallets page</Link> and click on the {name} wallet
                  from the list.
                </p>
              </div>
            }
            open={this.state.confirmAction}
            onConfirm={() => this.onClickAction(service, this.state.action)}
            onClose={() => this.setState({ confirmAction: false })}
          />
        )}
      </CenteredFormPage>
    )
  }

  render() {
    return <AppLayout>{this.renderContent()}</AppLayout>
  }
}

export default connect(null, { notifyError, notifyInfo, checkSyncStatus })(withRouter(AddWallet))
