import React, { Component } from 'react'
import Form from '../../../components/Form'
import CollectionSelect from '../../../controls/CollectionSelect'
import connect from 'react-redux/es/connect/connect'
import { setSession } from '../../../redux/reducers/session'
import PageHeader from '../../../components/PageHeader'
import LoginLayout from '../../../layouts/LoginLayout'
import { notifyInfo } from '../../../redux/reducers/notifier'
import ReactGA from 'react-ga'
import { HiddenInput } from '../../../controls/InputControls'
import axios from 'axios'

class ReviewSettings extends Component {
  onSuccess = session => {
    ReactGA.event({ category: 'user', action: 'signup' })
    this.props.setSession({ ...session, redirect_to_wallets: true })
    this.props.notifyInfo(`Welcome ${session.name}`)
  }

  setupPortfolioTracking = e => {
    e.preventDefault()
    axios
      .post('/api/users/review_settings', {
        user: { realize_gains_on_exchange: false, cost_basis_method: 'average_cost', copy_tax_settings: false },
      })
      .then(res => this.onSuccess(res.data))
  }

  render() {
    let session = this.props.session
    return (
      <LoginLayout>
        <div className="card">
          <div className="card-body">
            <PageHeader
              title="Review your settings"
              subtitle={
                <span>
                  We will setup Koinly with the recommended settings for calculating taxes in your home country. Just want to track your
                  portfolio? Click{' '}
                  <a href="#" onClick={this.setupPortfolioTracking}>
                    here
                  </a>{' '}
                  instead.
                </span>
              }
              className="pb-2"
              noCenter
            />
            <Form post={{ url: '/api/users/review_settings', root: 'user' }} onSuccess={this.onSuccess} submitText="Continue">
              <HiddenInput name={'copy_tax_settings'} value={true} />
              <CollectionSelect
                title="Base currency"
                help="Your crypto holdings, gains, investments etc will be displayed in this fiat currency. Ideally this will be the currency that you use to buy crypto"
                name="base_currency_id"
                value={session.base_currency.id}
                selectedOption={session.base_currency}
                url="/api/currencies?q[fiat_true]=1"
                optionLabel={o => o.symbol}
                optionSubtext={o => o.name}
                optionIcon={o => o.icon}
                search={query => ({ 'q[symbol_or_name_start]': query })}
                required
              />
              <CollectionSelect
                title="Home country"
                help="Your account will be set up to use the default tax settings for this country"
                name="country_id"
                value={session.country.id}
                selectedOption={session.country}
                url="/api/countries"
                optionLabel={o => o.name}
                search={query => ({ 'q[name_cont]': query })}
                required
              />
            </Form>
          </div>
        </div>
      </LoginLayout>
    )
  }
}

const mapStateToProps = ({ session }) => ({ session })
const mapDispatchToProps = { setSession, notifyInfo }

export default connect(mapStateToProps, mapDispatchToProps)(ReviewSettings)
