import React, { Component } from 'react'
import YearDetails from './_helpers/YearDetails'
import PageLoader from '../../components/PageLoader'
import moment from 'moment'
import CollectionSelect from '../../controls/CollectionSelect'
import { withRouter } from 'react-router-dom'
import Info from '../../components/Info'
import AppLayout from '../../layouts/AppLayout'
import GainsBlockedNotice from '../_helpers/GainsBlockedNotice'
import { connect } from 'react-redux'
import axios from 'axios'

class ReportsPage extends Component {
  state = {
    stats: null,
    reviewable: null,
  }

  componentDidMount() {
    this.loadReviewableWallets()
  }

  loadReviewableWallets() {
    if (this.state.reviewable) {
      return
    }

    axios.get(`/api/wallets/reviewable`).then(res => {
      this.setState({ reviewable: res.data })
    })
  }

  componentDidUpdate(oldProps) {
    if (oldProps.id !== this.props.id && this.state.stats) {
      this.setState({ stats: null })
    }
  }

  getSelectedYear() {
    let currentMonth = new Date().getMonth()
    let currentYear = new Date().getFullYear()
    // show last year if we are in the initial months of this year
    return this.props.match.params.year || (currentMonth < 6 ? currentYear - 1 : currentYear)
  }

  statsLoaded = response => {
    this.setState({ stats: response })
  }

  onYearChange = (_, year) => {
    if (Number.parseInt(year) === Number.parseInt(this.getSelectedYear())) {
      return
    }
    this.setState({ stats: null, year: year })
    this.props.history.push(`/reports/${year}`)
  }

  renderYearSelector() {
    let years = [2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010]
    return (
      <div style={{ display: 'inline-block', width: '120px', marginLeft: '10px' }}>
        <CollectionSelect
          name="year"
          value={this.getSelectedYear().toString()}
          onFormChange={this.onYearChange}
          options={years.map(String)}
          noGroup
        />
      </div>
    )
  }

  render() {
    let stats = this.state.stats
    let from =
      stats &&
      moment(stats.from)
        .parseZone()
        .format('D MMM YYYY')
    let to =
      stats &&
      moment(stats.to)
        .parseZone()
        .format('D MMM YYYY (ZZ)')
    return (
      <AppLayout>
        <div className="page-body container">
          <GainsBlockedNotice forceShow={this.state.stats && this.state.stats.gains_blocked} />
          <div className="row">
            <div className="col" style={{ textAlign: 'center' }}>
              <h2 className="pb-1">
                Tax report for
                {this.renderYearSelector()}
              </h2>
              {stats && (
                <div className="pb-5 text-muted">
                  {from} to {to}
                  <Info text="Reports will be generated for this time period, click on the dropdown above to change the tax year. If you want to change the day/month for your tax reports, you can do so on the Settings page" />
                </div>
              )}
            </div>
          </div>
          <PageLoader key={this.getSelectedYear()} url={`/api/stats/${this.getSelectedYear()}`} onLoad={this.statsLoaded} />
          {stats && <YearDetails stats={stats} year={this.getSelectedYear()} reviewable={this.state.reviewable} />}
        </div>
      </AppLayout>
    )
  }
}

const mapStateToProps = ({ session }) => ({ session })
export default connect(mapStateToProps, null)(withRouter(ReportsPage))
