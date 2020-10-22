import React from 'react'
import connect from 'react-redux/es/connect/connect'
import { withRouter, Link } from 'react-router-dom'
import { DEPOSIT_LABELS, WITHDRAW_LABELS } from '../../Constants'
import { TextInput, HiddenInput, ToggleInput, Button, MoreInfo } from '../../controls'
import EXCHANGE_DATA from './_helpers/ExchangeInfo'
import { notifyError, notifyInfo } from '../../redux/reducers/notifier'
import { checkSyncStatus } from '../../redux/reducers/syncStatus'
import Form from '../../components/Form'
import BigFormPage from '../../components/BigFormPage'
import AppLayout from '../../layouts/AppLayout'
import PageLoader from '../../components/PageLoader'
import _ from 'lodash'
import CollectionSelect from '../../controls/CollectionSelect'
import PageHeader from '../../components/PageHeader'
import { div } from '../../common/math'

const NoApiMessage = ({ wallet }) => (
  <BigFormPage title={wallet.wallet_service ? wallet.wallet_service.name : wallet.name}>
    <div className="alert alert-warning">
      {wallet.name} does not have any API support yet so you will need to import your transactions by uploading a csv file. Go to the{' '}
      <Link to={`/wallets/${wallet.id}/upload`}>File Import</Link> page for more info.
    </div>
  </BigFormPage>
)

const ShutdownMessage = ({ wallet }) => (
  <BigFormPage title={wallet.wallet_service.name}>
    <div className="alert alert-danger">
      Unfortunately, {wallet.wallet_service.name} has shut down. If you have a transactions file you can import it via the{' '}
      <Link to={`/wallets/${wallet.id}/upload`}>File Import</Link> page. You can also add the transactions manually.
    </div>
  </BigFormPage>
)

const OAuthRedirect = ({ wallet }) => (
  <BigFormPage title={wallet.name}>
    <p>
      You will be redirected to {wallet.wallet_service.name} to grant <strong>read-only</strong> access to your account. This{' '}
      <strong>does not</strong> give us access to move your funds.
    </p>
    {wallet.wallet_service.tag === 'coinbase' && (
      <p className="text-muted">Note: If you also trade on Coinbase Pro, you will need to add that account separately.</p>
    )}
    <div className="my-4">
      <Button color="primary" shouldFitContainer={true} onClick={e => (window.location = wallet.wallet_service.api_oauth_url)}>
        Continue to {wallet.wallet_service.name}
      </Button>
    </div>
  </BigFormPage>
)

class EditWalletApi extends React.Component {
  state = {}

  importPageLink(linkName) {
    return <Link to={`/wallets/${this.props.match.params.id}/upload`}>{linkName}</Link>
  }

  onSuccess = wallet => {
    this.props.notifyInfo(`${wallet.name} saved!`)
    window.Intercom('trackEvent', 'wallet-api-connected', { name: wallet.wallet_service.name })
    this.props.checkSyncStatus()
    this.props.history.goBack()
  }

  getFieldName = (origName, service) => {
    if (service.type === 'blockchain' || service.type === 'wallet') {
      if (origName === 'address') {
        return 'Public address or key'
      }
    }
    return _.capitalize(_.startCase(origName).toLowerCase())
  }

  renderApiField(wallet, field, required) {
    let Wrapper = TextInput
    let type = 'string'
    let name = field

    // field may also be a hash of key and type ex. { skip_history: "boolean" }
    if (typeof field === 'object') {
      name = Object.keys(field)[0]
      type = field[name]
      if (type === 'boolean') {
        Wrapper = ToggleInput
      }
    }

    return (
      <Wrapper
        key={name}
        title={this.getFieldName(name, wallet.wallet_service)}
        name={`api_options.${name}`}
        value={wallet.api_options[name]}
        required={required}
      />
    )
  }

  renderForm(wallet) {
    return (
      <>
        <Form
          update={{ url: `/api/wallets/${wallet.id}`, root: 'wallet' }}
          onCancel={this.props.history.goBack}
          onSuccess={this.onSuccess}
          submitText={'Secure Import'}
          otherActions={<div className="float-right small">{this.importPageLink('Or, import csv file')}</div>}
        >
          <HiddenInput name="api_connected" value={true} />
          {wallet.wallet_service.api_required_fields.map(field => this.renderApiField(wallet, field, true))}
          {wallet.wallet_service.api_optional_fields.map(field => this.renderApiField(wallet, field, false))}
          <ToggleInput
            name="api_options.skip_history"
            value={(wallet.api_options && wallet.api_options.skip_history) || false}
            title="Skip all history"
            help="Enable this if you are importing your historical data via CSV files. It will skip all transactions created before now."
          />
          <MoreInfo title={'More options'}>
            <ToggleInput
              name="api_options.ignore_reported_balances"
              value={(wallet.api_options && wallet.api_options.ignore_reported_balances) || false}
              title="Ignore reported balances"
              help="Enable this if you prefer to see the balances calculated by Koinly, instead of the balance reported by this API, on your dashboard"
            />
            {wallet.wallet_service.type === 'blockchain' && (
              <CollectionSelect
                title="Mark deposits as"
                name="api_options.deposit_label"
                value={wallet && wallet.api_options.deposit_label}
                options={DEPOSIT_LABELS}
                isClearable
              />
            )}
          </MoreInfo>
        </Form>
        <div className="small mt-4 d-flex text-muted">
          <div>
            <i className="fas fa-shield-alt pr-2 pt-1" style={{ fontSize: '1.5em' }} />
          </div>
          <div>
            Koinly needs read-access to your transaction data. You should disable all withdrawal and trading privileges from the API keys.
            For blockchains, you only have to add your public addresses or public keys - never enter your private keys!
          </div>
        </div>
      </>
    )
  }

  renderContent() {
    const wallet = this.state.wallet || this.props.location.state
    if (!wallet) {
      return <PageLoader url={`/api/wallets/${this.props.match.params.id}`} onLoad={wallet => this.setState({ wallet })} />
    } else if (!wallet.wallet_service || !wallet.wallet_service.api_active) {
      return <NoApiMessage wallet={wallet} />
    } else if (wallet.wallet_service.shutdown) {
      return <ShutdownMessage wallet={wallet} />
    } else if (wallet.wallet_service.api_oauth_url) {
      return <OAuthRedirect wallet={wallet} />
    }

    const info = EXCHANGE_DATA[wallet.wallet_service.tag]
    let left = null
    if (info && info.api) {
      left = <div className="alert alert-info small">{info.api}</div>
    }

    let cleanItem = item => <span dangerouslySetInnerHTML={{ __html: item.replace(/good:|bad:|limit:/, '') }} />
    let tickItems = []
    let limits = []
    let notes = []
    wallet.wallet_service.api_notes.forEach(item => {
      if (item.startsWith('good:') || item.startsWith('bad:')) {
        tickItems.push(item)
      } else if (item.startsWith('limit:')) {
        limits.push(item)
      } else {
        notes.push(item)
      }
    })

    return (
      <div className="page-body container">
        <PageHeader title={'Setting up auto-import'} className={'pb-2'} showBack left />
        <div className="row">
          <div className={`col-10 col-md-6`}>
            <p className="text-muted">
              Add your {wallet.wallet_service.name}{' '}
              {wallet.wallet_service.type === 'blockchain' || wallet.wallet_service.type === 'wallet' ? 'public key/address' : 'api keys'}{' '}
              below to import data automatically.
            </p>
            {limits.length === 1 && <div className={'alert alert-warning small'}>{cleanItem(limits[0])}</div>}
            {limits.length > 1 && (
              <div className={'alert alert-warning small'}>
                <ul className="pl-2 mb-0">
                  {limits.map(limit => (
                    <li className="mb-1">{cleanItem(limit)}</li>
                  ))}
                </ul>
              </div>
            )}
            {this.renderForm(wallet)}
          </div>
          <div className="col-10 offset-1 col-md-6 offset-md-0">
            {tickItems.length > 0 && (
              <div className="row pb-3">
                {tickItems.map(item => (
                  <div className={'small col-4 pt-2 pr-0'}>
                    {item.includes('good:') ? (
                      <i className="fas fa-check-circle text-success pr-2" />
                    ) : (
                      <i className="fas fa-times-circle text-danger pr-2" />
                    )}
                    {cleanItem(item)}
                  </div>
                ))}
              </div>
            )}
            {notes.length > 0 && (
              <div className="text-muted small pb-2">
                <i className="fas fa-info-circle pr-2" /> {notes.map(note => cleanItem(note))}
              </div>
            )}
            {left}
          </div>
        </div>
      </div>
    )
  }

  render() {
    return <AppLayout>{this.renderContent()}</AppLayout>
  }
}

export default connect(null, { notifyError, notifyInfo, checkSyncStatus })(withRouter(EditWalletApi))
