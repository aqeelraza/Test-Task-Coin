import React from 'react'
import { withRouter } from 'react-router-dom'
import connect from 'react-redux/es/connect/connect'
import PageLoader from '../../components/PageLoader'
import { TextInput } from '../../controls'
import CenteredFormPage from '../../components/CenteredFormPage'
import { notifyError, notifyInfo } from '../../redux/reducers/notifier'
import AppLayout from '../../layouts/AppLayout'

class EditWallet extends React.Component {
  state = {
    wallet: null,
  }

  onWalletSaved = wallet => {
    this.props.notifyInfo(`${wallet.name} updated!`)
    this.props.history.goBack()
  }

  renderContent() {
    const wallet = this.state.wallet || this.props.location.state
    if (!wallet) {
      return <PageLoader url={`/api/wallets/${this.props.match.params.id}`} onLoad={wallet => this.setState({ wallet })} />
    }

    return (
      <CenteredFormPage
        title={`Editing ${wallet.name}`}
        update={{
          url: `/api/wallets/${this.props.match.params.id}`,
          root: 'wallet',
        }}
        onSuccess={this.onWalletSaved}
        onCancel={this.props.history.goBack}
        showBack
      >
        <TextInput title="Wallet Name" name="name" value={wallet.name} />
      </CenteredFormPage>
    )
  }

  render() {
    return <AppLayout>{this.renderContent()}</AppLayout>
  }
}

export default connect(null, { notifyError, notifyInfo })(withRouter(EditWallet))
