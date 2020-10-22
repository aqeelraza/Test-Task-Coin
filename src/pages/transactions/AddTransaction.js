import React from 'react'
import connect from 'react-redux/es/connect/connect'
import { withRouter } from 'react-router-dom'
import { notifyError, notifyInfo } from '../../redux/reducers/notifier'
import { checkSyncStatus } from '../../redux/reducers/syncStatus'
import BaseTxnForm from './_helpers/BaseTxnForm'
import { LINKS } from '../../Constants'
import AppLayout from '../../layouts/AppLayout'
import PageHeader from '../../components/PageHeader'
import Form from '../../components/Form'

class AddTransaction extends BaseTxnForm {
  onSuccess = () => {
    this.props.checkSyncStatus()
    this.props.notifyInfo('Transaction added!')
    this.props.history.goBack()
    window.Intercom('trackEvent', 'manual-transaction-added', { type: this.props.match.params.type })
  }

  componentWillMount() {
    this.setState({ type: this.props.match.params.type })
  }

  render() {
    return (
      <AppLayout>
        <div className="page-body container">
          <div className="row">
            <div className="col" />
            <div className="col-xl-5 col-lg-6 col-md-8 col-10">
              <PageHeader
                title={'New Transaction'}
                subtitle={
                  <div className={'text-center'}>
                    Learn more about manual transactions in our{' '}
                    <a href={LINKS.adding_manual_txns} target={'_blank'}>
                      help guide
                    </a>
                    .
                  </div>
                }
                noCenter
              />
            </div>
            <div className="col" />
          </div>
          <Form
            post={{ url: '/api/transactions', root: 'transaction' }}
            onSuccess={this.onSuccess}
            onCancel={this.props.history.goBack}
            actionWrapper={props => <div className="text-center">{props.children}</div>}
            showCancel
          >
            {this.renderFormFields()}
          </Form>
        </div>
      </AppLayout>
    )
  }
}

function mapStateToProps({ session }) {
  return { session }
}

export default connect(mapStateToProps, { notifyError, notifyInfo, checkSyncStatus })(withRouter(AddTransaction))
