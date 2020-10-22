import React from 'react'
import axios from 'axios'
import { toastr } from 'react-redux-toastr'
import _ from 'lodash'
import AppLayout from '../../layouts/AppLayout'
import Loader from '../../components/Loader'
import connect from 'react-redux/es/connect/connect'
import { setApiKey } from '../../redux/reducers/apiKey'
import { setSession } from '../../redux/reducers/session'
import { withRouter } from 'react-router-dom'
import queryString from 'query-string'

class FindAndApplyDiscount extends React.Component {
  componentDidMount() {
    let params = queryString.parse(this.props.location.search)
    axios
      .post('/api/users/apply_email_promo', params)
      .then(res => this.props.history.push('/plans'))
      .catch(error => this.onError(error))
  }

  onError(res) {
    toastr.error(_.get(res, 'response.data.errors[0].detail') || res.message)
    this.props.history.push('/')
  }

  render() {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    )
  }
}

function mapStateToProps({ session }) {
  return { session }
}

export default connect(mapStateToProps, { setApiKey, setSession })(withRouter(FindAndApplyDiscount))
