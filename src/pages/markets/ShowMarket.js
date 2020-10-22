import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { Colors, math } from '../../common'
import PageLoader from '../../components/PageLoader'
import { notifyError, notifyInfo } from '../../redux/reducers/notifier'
import { checkSyncStatus } from '../../redux/reducers/syncStatus'
import Highcharts from 'highcharts/highstock'
import AppLayout from '../../layouts/AppLayout'

class ShowMarket extends Component {
  state = {
    rates: null,
  }

  componentDidUpdate() {
    this.configureChart()
  }

  configureChart() {
    let { rates } = this.state.rates
    rates = rates.map(item => [new Date(item[0]).getTime(), math.decimal(item[1], 8)])

    const options = {
      chart: {
        type: 'areaspline',
        zoomType: 'x',
        height: 375,
      },
      title: {
        text: '',
      },
      navigator: {
        enabled: false,
      },
      tooltip: {
        shared: true,
      },
      credits: {
        enabled: false,
      },
      xAxis: {
        type: 'datetime',
      },
      yAxis: {
        opposite: true,
        title: {
          enabled: false,
        },
      },
      // rangeSelector: {
      //   visible: false,
      //   buttonPosition: {
      //     align: 'right'
      //   },
      //   labelStyle: {
      //     display: 'none'
      //   },
      //   inputEnabled: false,
      //   enabled: true,
      //   selected: 5 // index of zoom button thats selected by default
      // },
      plotOptions: {
        areaspline: {
          fillOpacity: 0.25,
          lineWidth: 3,
          states: {
            hover: {
              lineWidth: 4,
            },
          },
          marker: {
            enabled: false,
          },
        },
      },
      colors: [Colors.blue],
      series: [
        {
          name: 'USD',
          data: rates,
          zIndex: 40,
        },
      ],
    }

    Highcharts.chart('market-chart', options)
  }

  renderContent() {
    if (!this.state.rates) {
      return (
        <PageLoader
          url={`/api/rates/${this.props.match.params.id}${this.props.location.search}`}
          onLoad={rates => this.setState({ rates })}
        />
      )
    }

    let assetName = this.state.rates.currency.name
    return (
      <div className="page-body container">
        <div className="row">
          <div className="col text-center mb-3">
            <h2 className="d-inline-block align-top">
              {assetName} ({this.state.rates.currency.symbol})
            </h2>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col border whitebg">
            <div id="market-chart" />
          </div>
        </div>
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

export default connect(mapStateToProps, { notifyError, notifyInfo, checkSyncStatus })(withRouter(ShowMarket))
