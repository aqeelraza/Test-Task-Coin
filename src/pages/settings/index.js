import React, { Component, Fragment } from 'react'
import connect from 'react-redux/es/connect/connect'
import { InputGroup, FormGroup, Nav, NavItem, NavLink } from 'reactstrap'
import { Button, ToggleInput, TextInput, EmailInput, PasswordInput, Label } from '../../controls/index'
import CollectionSelect from '../../controls/CollectionSelect'
import { notifyError, notifyInfo } from '../../redux/reducers/notifier'
import { setApiKey } from '../../redux/reducers/apiKey'
import { setSession } from '../../redux/reducers/session'
import { email } from '../../common/validators'
import { PRICING_STRATEGIES, COST_BASIS_METHODS, MONTHS_OF_YEAR, DAYS_OF_MONTH } from '../../Constants'
import Info from '../../components/Info'
import moment from 'moment'
import { checkSyncStatus } from '../../redux/reducers/syncStatus'
import AppLayout from '../../layouts/AppLayout'
import Form from '../../components/Form'
import { Route, Switch, NavLink as RouterNavLink } from 'react-router-dom'
import allTimezones from '../../common/allTimezones.js'
import ConfirmDialog from '../../components/ConfirmDialog'
import axios from 'axios'
import { toastr } from 'react-redux-toastr'
import _ from 'lodash'
import { getCostBasisMethodName } from '../../common'
import { validServerToken } from '../../common/csrf-token'

class SettingsPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: props.session,
      editingPassword: false,
      yearStartDay: props.session.year_start_day,
      yearStartMonth: props.session.year_start_month,
      selectedCountry: props.session.country,
      selectedCostBasisMethod: props.session.cost_basis_method,
    }
  }

  onSuccess = user => {
    this.props.setApiKey(user.api_token).then(() => this.props.setSession(user))
    this.props.checkSyncStatus()
    this.props.notifyInfo(`Settings updated!`)
    this.setState({ user, editingPassword: false })
  }

  getTaxYearText() {
    let day = this.state.yearStartDay
    let month = this.state.yearStartMonth - 1 // sub 1 cus server expects between 1 and 12
    let year = new Date().getFullYear()
    let from = moment([year, month, day]).format('D/M/YYYY')
    let to = moment([year, month, day])
      .startOf('day')
      .add(1, 'years')
      .subtract(1, 'seconds')
      .format('D/M/YYYY')
    return from + ' to ' + to
  }

  renderTaxYearSelection(user) {
    return (
      <Fragment>
        <Label>
          Beginning of tax reporting year (day & month)
          <Info text="This is used to determine the start and end date for the reporting period on the Reports page" />
        </Label>
        <FormGroup style={{ marginBottom: '0' }}>
          <InputGroup style={{ alignItems: 'center' }}>
            <div className="col" style={{ padding: '0', maxWidth: '200px', marginRight: '10px' }}>
              <CollectionSelect
                name="year_start_day"
                value={user.year_start_day}
                options={DAYS_OF_MONTH}
                onChange={selected => this.setState({ yearStartDay: selected.id })}
                required
              />
            </div>
            <div className="col" style={{ padding: '0' }}>
              <CollectionSelect
                name="year_start_month"
                value={user.year_start_month}
                options={MONTHS_OF_YEAR}
                onChange={selected => this.setState({ yearStartMonth: selected.id })}
                required
              />
            </div>
          </InputGroup>
        </FormGroup>
        <div className="text-right pr-1 text-muted small" style={{ marginTop: '-1rem' }}>
          Report year: {this.getTaxYearText()}
        </div>
      </Fragment>
    )
  }

  renderIrelandTaxYears(user) {
    let periods = [
      { name: 'Initial period - 1 January to 30 November', id: 'initial' },
      { name: 'Later period - 1 December to 31 December', id: 'later' },
    ]
    return (
      <Fragment>
        <CollectionSelect
          title="Tax reporting period"
          help="This is used to determine the start and end date for the reporting period on the Reports page"
          name="tax_period"
          value={user.tax_period || 'initial'}
          options={periods}
        />
      </Fragment>
    )
  }

  formProps() {
    return {
      update: { url: `/api/users/${this.state.user.id}`, root: 'user' },
      onSuccess: this.onSuccess,
    }
  }

  renderAccountForm(user) {
    return (
      <Form {...this.formProps()}>
        <h4 className="pb-3">Account & profile settings</h4>
        <TextInput title="Name" name="name" value={user.name} required />
        <EmailInput title="Email" name="email" value={user.email} validators={[email]} />
        {this.state.editingPassword && <PasswordInput title="New Password" name="password" minLength={5} />}
        {!this.state.editingPassword && (
          <div style={{ paddingBottom: '1rem' }}>
            <Button color="link" onClick={() => this.setState({ editingPassword: true })}>
              Change password
            </Button>
          </div>
        )}
      </Form>
    )
  }

  renderAffiliateForm(user) {
    return (
      <Form {...this.formProps()}>
        <h4 className="pb-3">Affiliate settings</h4>
        <EmailInput
          title="Paypal Email"
          help="Affiliate payouts will be made to this paypal id."
          name="affiliate_paypal_email"
          value={user.affiliate_paypal_email}
          validators={[email]}
        />
      </Form>
    )
  }

  renderTaxFieldsForm(user) {
    return (
      <Form {...this.formProps()}>
        <h4 className="pb-3">Tax Information</h4>
        <p>You do not need to fill in anything on this page unless you have been asked to do so when trying to download a tax report.</p>
        <TextInput title="Personal ID Number" name="tax_personal_id" value={user.tax_personal_id} />
        <TextInput title="Postal code" name="tax_postal_code" value={user.tax_postal_code} />
        <TextInput title="City" name="tax_city" value={user.tax_city} />
      </Form>
    )
  }

  onRecalculateGains = () => {
    if (this.state.recalculating) return
    this.setState({ recalculating: true })
    axios
      .post('/api/users/recalculate_gains')
      .then(response => {
        this.props.checkSyncStatus()
        this.props.notifyInfo(`Your gains are being recalculated!`)
        this.setState({ recalculating: false })
      })
      .catch(res => {
        toastr.error(_.get(res, 'response.data.errors[0].detail') || res.message)
        this.setState({ recalculating: false })
      })
  }

  filterCostBasisMethods(user, country) {
    // show only currently selected + filtered methods
    let methods = COST_BASIS_METHODS.filter(method => !method.disabled && (!method.country || method.country === country.code))
    if (!methods.find(method => user.cost_basis_method === method.id)) {
      let existing = COST_BASIS_METHODS.find(method => user.cost_basis_method === method.id)
      if (!existing) {
        existing = { id: user.cost_basis_method, name: user.cost_basis_method }
      }
      methods.unshift(existing)
    }
    return methods
  }

  renderGeneral(user) {
    return (
      <Form {...this.formProps()}>
        <h4 className="pb-3">General settings</h4>
        <CollectionSelect
          title="Base currency"
          help="Your crypto holdings, gains, investments etc will be displayed in this fiat currency. Ideally this will be the currency that you use to buy crypto"
          name="base_currency_id"
          value={user.base_currency.id}
          selectedOption={user.base_currency}
          url="/api/currencies?q[fiat_true]=1"
          optionLabel={o => o.symbol}
          optionSubtext={o => o.name}
          optionIcon={o => o.icon}
          search={query => ({ 'q[symbol_or_name_start]': query })}
          required
        />
        <CollectionSelect
          title="Home country"
          help="Set your home country for tax purposes."
          name="country_id"
          value={user.country.id}
          selectedOption={user.country}
          url="/api/countries"
          onChange={country => this.setState({ selectedCountry: country })}
          optionLabel={o => o.name}
          search={query => ({ 'q[name_start]': query })}
          required
        />
        <CollectionSelect
          title="Cost basis method"
          help="This is the method used to generate your gains."
          name="cost_basis_method"
          value={user.cost_basis_method}
          optionLabel={o => getCostBasisMethodName(user, o.id)}
          options={this.filterCostBasisMethods(user, this.state.selectedCountry)}
          required
        />
        {validServerToken() && user.pricing_strategy !== 'prefer_trusted' && (
          <CollectionSelect
            title="Pricing strategy"
            help="This determines which coin's market price to use when you exchange cryptocurrencies ex. BTC → DASH"
            name="pricing_strategy"
            placeholder={'Default'}
            value={user.pricing_strategy || ''}
            options={PRICING_STRATEGIES}
          />
        )}
        {/*<CollectionSelect*/}
        {/*title="Cost tracking method"*/}
        {/*help="The default Global setting will share the cost basis across all your wallets (recommended). If you set it to Wallet-based then each wallet will maintain its own cost basis."*/}
        {/*name="account_based_cost_basis"*/}
        {/*value={user.account_based_cost_basis}*/}
        {/*options={COST_TRACKING_METHODS}*/}
        {/*required*/}
        {/*/>*/}
        {user.country.code === 'IRL' ? this.renderIrelandTaxYears(user) : this.renderTaxYearSelection(user)}
        <CollectionSelect
          title="Timezone for reports"
          name="timezone"
          help="Timezone is used to determine the correct start and end time of your reporting year"
          value={user.timezone}
          options={allTimezones}
          required
        />

        <ToggleInput
          title="Realize gains on crypto → crypto trades?"
          name="realize_gains_on_exchange"
          value={user.realize_gains_on_exchange}
        />
        <ToggleInput
          title="Treat margin gains as capital gains"
          name="treat_margin_gains_as_capital_gains"
          help="If this is enabled profits/losses from margin trades will be included in your capital gains reports. Disable this if you prefer to declare margin gains separately"
          value={user.treat_margin_gains_as_capital_gains}
        />
        <ToggleInput
          title="Realize gains on transfer fees?"
          name="realize_transfer_fees"
          help="If this is enabled transfer fees will be treated as withdrawals and you will realize gains on them. When this is disabled transfer fees are only realized when you finally sell the coins."
          value={user.realize_transfer_fees}
        />
        <ToggleInput
          title="Wallet based cost-tracking"
          name="account_based_cost_basis"
          help="If this is enabled your cost basis will be tracked separately for each wallet."
          value={user.account_based_cost_basis}
        />

        <ConfirmDialog
          text="This will result in your gains being recalculated from scratch. Are you sure you want to continue?"
          onConfirm={this.onRecalculateGains}
          tag={'a'}
          className="small text-danger float-right"
          href="#"
        >
          Delete cache
        </ConfirmDialog>
      </Form>
    )
  }

  render() {
    const user = this.state.user
    return (
      <AppLayout>
        <div className="page-body container">
          <div className="row">
            <div className="col-4 col-md-4 col-lg-3">
              <Nav vertical pills>
                <NavItem>
                  <NavLink tag={RouterNavLink} to="/settings" exact>
                    General
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={RouterNavLink} to="/settings/account" exact>
                    Account
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={RouterNavLink} to="/settings/taxinfo" exact>
                    Tax Info
                  </NavLink>
                </NavItem>
                {user.my_coupon.affiliate && (
                  <NavItem>
                    <NavLink tag={RouterNavLink} to="/settings/affiliate" exact>
                      Affiliate
                    </NavLink>
                  </NavItem>
                )}
              </Nav>
            </div>
            <div className="col col-md-6 border bg-white p-4 rounded">
              <Switch>
                <Route exact path="/settings" render={() => this.renderGeneral(user)} />
                <Route exact path="/settings/account" render={() => this.renderAccountForm(user)} />
                <Route exact path="/settings/affiliate" render={() => this.renderAffiliateForm(user)} />
                <Route exact path="/settings/taxinfo" render={() => this.renderTaxFieldsForm(user)} />
              </Switch>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }
}

function mapStateToProps({ session }) {
  return {
    session,
  }
}

export default connect(mapStateToProps, { setApiKey, setSession, notifyError, notifyInfo, checkSyncStatus })(SettingsPage)
