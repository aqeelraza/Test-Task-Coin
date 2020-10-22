import React from 'react'
import { withRouter } from 'react-router-dom'
import connect from 'react-redux/es/connect/connect'
import PageLoader from '../../components/PageLoader'
import { notifyError, notifyInfo } from '../../redux/reducers/notifier'
import { checkSyncStatus } from '../../redux/reducers/syncStatus'
import BaseTxnForm from './_helpers/BaseTxnForm'
import AppLayout from '../../layouts/AppLayout'
import PageHeader from '../../components/PageHeader'
import Form from '../../components/Form'

class EditTransaction extends BaseTxnForm {
  txnSaved = () => {
    this.props.checkSyncStatus()
    this.props.notifyInfo('Transaction saved!')
    this.props.history.goBack()
  }

  componentDidMount(props) {
    if (this.props.location.state) {
      this.onTxnLoaded(this.props.location.state)
      this.setState({ txn: this.props.location.state })
    }
  }

  renderContent() {
    const txn = this.state.txn
    if (!txn) {
      return <PageLoader url={`/api/transactions/${this.props.match.params.id}`} onLoad={this.onTxnLoaded} />
    }

    return (
      <div className="page-body container">
        <div className="row">
          <div className="col" />
          <div className="col-xl-5 col-lg-6 col-md-8 col-10">
            <PageHeader
              title={
                <>
                  Transaction{' '}
                  <span className="small text-muted pl-2" style={{ fontSize: '0.5em' }}>
                    #{txn.id}
                  </span>
                </>
              }
              noCenter
            />
          </div>
          <div className="col" />
        </div>
        <Form
          onSuccess={this.txnSaved}
          onCancel={this.props.history.goBack}
          actionWrapper={props => <div className="text-center">{props.children}</div>}
          update={{
            url: `/api/transactions/${this.props.match.params.id}`,
            root: 'transaction',
          }}
          showCancel
        >
          {this.renderFormFields()}
        </Form>
      </div>
    )
  }

  render() {
    return <AppLayout>{this.renderContent()}</AppLayout>
  }
}

function mapStateToProps({ session }) {
  return { session }
}

export default connect(mapStateToProps, { notifyError, notifyInfo, checkSyncStatus })(withRouter(EditTransaction))
