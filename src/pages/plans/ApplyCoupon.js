import React from 'react'
import { withRouter } from 'react-router-dom'
import connect from 'react-redux/es/connect/connect'
import { TextInput } from '../../controls'
import CenteredFormPage from '../../components/CenteredFormPage'
import { notifyError, notifyInfo } from '../../redux/reducers/notifier'
import AppLayout from '../../layouts/AppLayout'

class ApplyCoupon extends React.Component {
  state = {
    wallet: null,
  }

  onSuccess = user => {
    this.props.notifyInfo(`Coupon has been applied!`)
    this.props.history.goBack()
  }

  render() {
    return (
      <AppLayout>
        <CenteredFormPage
          title={`Applying coupon`}
          post={{
            url: `/api/users/apply_coupon`,
          }}
          onSuccess={this.onSuccess}
          onCancel={this.props.history.goBack}
          showBack
        >
          <TextInput title="Coupon Code" name="coupon" helpBottom={'If you received a coupon code or credit voucher, enter it here'} />
        </CenteredFormPage>
      </AppLayout>
    )
  }
}

export default connect(null, { notifyError, notifyInfo })(withRouter(ApplyCoupon))
