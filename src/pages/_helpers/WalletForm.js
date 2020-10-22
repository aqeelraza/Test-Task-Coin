import { MoreInfo, TextInput } from '../../controls'
import _ from 'lodash'
import React, { Component } from 'react'
import { DEPOSIT_LABELS, WITHDRAW_LABELS } from '../../Constants'
import CollectionSelect from '../../controls/CollectionSelect'
import ReactGA from 'react-ga'

export default class WalletForm extends Component {
  onWalletAdded = wallet => {
    if (wallet.api_connected) {
      this.props.checkSyncStatus()
      this.props.notifyInfo(`Your wallet '${wallet.name}' is being synced! This can take a few minutes...`)
    } else {
      this.props.notifyInfo(`Added ${wallet.name}`)
    }
    window.Intercom('trackEvent', 'wallet-added', { name: wallet.name, synced: wallet.api_connected })
    ReactGA.event({ category: 'user', action: 'wallet-added' })
    this.props.history.push('/wallets')
  }

  onWalletSaved = wallet => {
    this.props.notifyInfo(`${wallet.name} saved!`)
    this.props.history.goBack()
  }

  renderRequiredFields = (service, wallet) =>
    service.api_required_fields.map(requiredField => (
      <TextInput
        key={requiredField}
        title={_.startCase(_.camelCase(requiredField))}
        name={`api_options.${requiredField}`}
        value={wallet ? wallet.api_options[requiredField] : undefined}
        required
      />
    ))

  renderOptionalFields = wallet => {
    let depositLabels = [{ id: '', name: ' - ' }]
    let withdrawalLabels = [{ id: '', name: ' - ' }]

    DEPOSIT_LABELS.forEach(label => depositLabels.push({ id: label, name: _.capitalize(label) }))

    WITHDRAW_LABELS.forEach(label => withdrawalLabels.push({ id: label, name: _.capitalize(label) }))

    return (
      <MoreInfo title={'More options'}>
        <CollectionSelect
          title="Mark deposits as"
          name="api_options.deposit_label"
          value={wallet && wallet.api_options.deposit_label}
          options={depositLabels}
        />
        <CollectionSelect
          title="Mark withdrawals as"
          name="api_options.withdrawal_label"
          value={wallet && wallet.api_options.withdrawal_label}
          options={withdrawalLabels}
        />
      </MoreInfo>
    )
  }
}
