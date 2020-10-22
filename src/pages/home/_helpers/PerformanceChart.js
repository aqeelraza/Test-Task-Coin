import React, { Component } from 'react'
import Highcharts from 'highcharts/highstock'
import { Colors, formatMoney, getDelta, getDeltaColor, math } from '../../../common'
import classNames from 'classnames'
import moment from 'moment'
import Info from '../../../components/Info'

const DownArrow = () => <i className="fas fa-arrow-down" />

const UpArrow = () => <i className="fas fa-arrow-up" />

class PerformanceChart extends Component {
  componentDidMount() {
    this.configureChart()
  }

  componentDidUpdate(prevProps) {
    if (this.props.data !== prevProps.data) {
      this.configureChart()
    }
  }

  fakeData() {
    return [
      { total_worth: 0, invested: 0, gains: 0, date: this.props.from },
      { total_worth: 0, invested: 0, gains: 0, date: this.props.to },
    ]
  }

  configureChart = () => {
    let { data } = this.props
    if (data !== null) {
      if (data.length === 0) {
        data = this.fakeData()
      } else if (data.length === 1) {
        data = [this.fakeData()[0], data[0]]
      } else if (new Date(data[0].date) !== this.props.from.toDate()) {
        data.unshift(this.fakeData()[0])
      }
    }

    let worth = []
    let invested = []
    // let gains = []

    if (data) {
      data.forEach(item => (item.date = new Date(item.date).getTime()))
      worth = data.map(item => [item.date, math.decimal(item.total_worth, 2)])
      invested = data.map(item => [item.date, math.decimal(item.invested, 2)])
      // gains = data.map(item => [item.date, math.decimal(item.gains, 2)])
    }

    const options = {
      chart: {
        type: 'areaspline',
        zoomType: 'x',
        height: 300,
        spacingBottom: 0,
        spacingTop: 0,
        spacingLeft: 0,
        spacingRight: 0,
        backgroundColor: 'transparent',
      },
      title: {
        text: '',
      },
      legend: {
        enabled: false,
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
        visible: false,
      },
      yAxis: {
        visible: false,
        opposite: true,
        min: null,
        max: null,
        startOnTick: false,
        endOnTick: false,
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
      colors: [Colors.blue, Colors.grey, Colors.green],
      series: [
        {
          name: 'Worth',
          data: worth,
          zIndex: 30,
          fillColor: {
            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            stops: [
              [0, Highcharts.getOptions().colors[0]],
              [
                1,
                Highcharts.Color(Highcharts.getOptions().colors[0])
                  .setOpacity(0)
                  .get('rgba'),
              ],
            ],
          },
        },
        {
          name: 'Cost basis',
          data: invested,
          zIndex: 40,
          fillColor: 'transparent',
          dashStyle: 'Dash',
        },
      ],
    }

    Highcharts.chart('perf-chart', options)
  }

  render() {
    let { stats } = this.props

    let gains = math.decimal(stats.total_crypto_worth, 0) - math.decimal(stats.total_invested, 0)
    let worth = formatMoney(math.decimal(stats.total_crypto_worth, 0), this.props.currency, { minimumFractionDigits: 0 })
    let invested = formatMoney(math.decimal(stats.total_invested, 0), this.props.currency, { minimumFractionDigits: 0 })
    let displayGains = formatMoney(gains, this.props.currency, { minimumFractionDigits: 0 })
    let delta = getDelta(stats.total_crypto_worth, stats.total_invested)

    return (
      <>
        <div
          className={classNames({
            'box-shadow border rounded whitebg mb-3': true,
            pulsate: this.props.loading,
            'd-none': this.props.session.country.code === 'FRA' && !this.props.session.active_subscription,
          })}
        >
          <div className="d-flex justify-content-between px-3 pt-3 pb-1">
            <div>
              <div className="small text-muted">
                Total Value
                <Info text={'Current market value of all your crypto holdings (fiat is not included)'} size="0.75rem" />
              </div>
              <div>
                <h3 className="d-inline-block pt-1" style={{ color: Colors.blue }}>
                  {worth || <div className="invisible">0</div>}
                </h3>
                {worth && (
                  <div className="d-inline-block pl-2" style={{ color: getDeltaColor(delta) }}>
                    {math.neg(delta) ? <DownArrow /> : <UpArrow />}
                    <span className="ml-1">{delta}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="small text-muted">
                Cost basis
                <Info
                  text={
                    'Cost of all your crypto holdings. Every crypto to crypto trade is also considered a new investment, so this value is *not* the total fiat you have spent on crypto!'
                  }
                  size="0.75rem"
                />
              </div>
              <h3 className="pt-1" style={{ color: Colors.grey }}>
                {invested}
              </h3>
            </div>
            <div className="text-right">
              <div className="small text-muted">
                Unrealized gains
                <Info text={'Difference between your portfolio value and cost basis'} size="0.75rem" />
              </div>
              <h3 className="pt-1" style={{ color: getDeltaColor(gains) }}>
                {displayGains}
              </h3>
            </div>
          </div>
          <div id="perf-chart" style={{ marginLeft: '-8px', marginRight: '-8px' }} />
        </div>
      </>
    )
  }
}

export default PerformanceChart
