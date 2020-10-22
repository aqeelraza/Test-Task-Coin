import React, { Component } from 'react'
import connect from 'react-redux/es/connect/connect'
import { Redirect } from 'react-router-dom'
import Select, { components } from '@atlaskit/select'
import CalendarIcon from '@atlaskit/icon/glyph/calendar'
import moment from 'moment'
import axios from 'axios'
import PageLoader from '../../components/PageLoader'
import Loader from '../../components/Loader'
import ErrorPage from '../../components/ErrorPage'
import AppLayout from '../../layouts/AppLayout'
import { setSession } from '../../redux/reducers/session'
import GainsBlockedNotice from '../_helpers/GainsBlockedNotice'
import PerformanceChart from './_helpers/PerformanceChart'
import Assets from './_helpers/Assets'
import SideStats from './_helpers/SideStats'
import NextStepsBox from './_helpers/NextStepsBox'
import ReviewSettings from './_helpers/ReviewSettings'

const DropdownIndicator = props => {
  return (
    <components.DropdownIndicator {...props}>
      <CalendarIcon label="Date range" />
    </components.DropdownIndicator>
  )
}

class Home extends Component {
  presets = [
    { id: 'Last 7 Days', from: moment().subtract(7, 'days'), to: moment() },
    { id: 'Last 30 Days', from: moment().subtract(30, 'days'), to: moment() },
    { id: 'Last 6 Months', from: moment().subtract(6, 'months'), to: moment() },
    { id: 'Last 1 Year', from: moment().subtract(1, 'year'), to: moment() },
    {
      id: 'Last Year',
      from: moment()
        .subtract(1, 'year')
        .startOf('year'),
      to: moment()
        .subtract(1, 'year')
        .endOf('year'),
    },
    { id: 'This Year', from: moment().startOf('year'), to: moment() },
  ]

  state = {
    loading: false,
    stats: null,
    error: null,
    selected: this.presets[this.presets.length - 1],
  }

  componentDidMount() {
    this.loadStats(this.state.selected)
  }

  onSelectionChanged(item) {
    this.loadStats(item)
    this.setState({ selected: item })
  }

  formatOptionLabel = opt => {
    let from = moment(opt.from).format('MMM D, YYYY')
    let to = moment(opt.to).format('MMM D, YYYY')
    return (
      <div>
        {opt.id}
        <small className="pl-2 text-muted">
          {from} - {to}
        </small>
      </div>
    )
  }

  loadStats(item) {
    if (this.state.loading) {
      return
    }

    this.setState({ loading: true })
    axios
      .get(`/api/stats?from=${item.from.toString()}&to=${item.to.toString()}`)
      .then(res => {
        this.setState({ loading: false, stats: res.data, error: null })
      })
      .catch(error => {
        console.log(error)
        this.setState({ loading: false, stats: null, error })
      })
  }

  renderContent() {
    const { stats } = this.state
    if (!stats) {
      return <Loader />
    }

    if (this.state.error) {
      return <ErrorPage error={this.state.error} onRetry={() => this.loadStats()} />
    }

    let item = this.state.selected

    return (
      <div className="page-body container">
        <GainsBlockedNotice />
        <NextStepsBox />
        <div className="row">
          <div className="col-lg-8 col-md-7 col-12">
            <PageLoader url={`/api/snapshots?from=${item.from.toString()}&to=${item.to.toString()}`}>
              {(response, loading) => (
                <PerformanceChart
                  data={response}
                  stats={stats}
                  session={this.props.session}
                  currency={this.props.session.base_currency}
                  from={item.from}
                  to={item.to}
                  loading={loading}
                />
              )}
            </PageLoader>
            <Assets currency={this.props.session.base_currency} onAssetsLoaded={assets => this.setState({ assets })} />
          </div>
          <div className="col-lg-4 col-md-5 d-none d-md-block">
            <Select
              getOptionLabel={item => item.id}
              getOptionValue={item => item.id}
              formatOptionLabel={this.formatOptionLabel}
              onChange={item => this.onSelectionChanged(item)}
              value={this.state.selected}
              options={this.presets}
              className="collection-select"
              components={{ DropdownIndicator }}
            />
            <SideStats
              stats={stats}
              session={this.props.session}
              currency={this.props.session.base_currency}
              from={this.state.selected.from.toString()}
              assets={this.state.assets}
            />
          </div>
        </div>
      </div>
    )
  }

  render() {
    if (!this.props.session.settings_reviewed) {
      return <ReviewSettings />
    }

    if (this.props.session.redirect_to_wallets) {
      this.props.setSession({ ...this.props.session, redirect_to_wallets: false })
      return <Redirect to={'/wallets/select'} />
    }

    return <AppLayout>{this.renderContent()}</AppLayout>
  }
}

const mapStateToProps = ({ session }) => ({ session })
const mapDispatchToProps = { setSession }
export default connect(mapStateToProps, mapDispatchToProps)(Home)
